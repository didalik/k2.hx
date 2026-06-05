import vault from '../lib/vault.js' // {{{1
import { Context, } from '../lib/util.js'
import { makeOffer, txDesc, } from '../lib/api.js'

let stateInitial = { // {{{1
  handle: handle_stateInitial,
}, stateCynBobDeal = { // {{{1
  handle: handle_stateCynBobDeal,
}
Object.assign(stateInitial, Promise.withResolvers())
Object.assign(stateCynBobDeal, Promise.withResolvers())

let context = new Context(stateInitial, 'Bob') // {{{1

let watcher = vault.watch(null, (eventType, filename) => { // {{{1
  if (filename.startsWith('Issuer.desc.')) {
    let v = vault.get(filename)
    //console.log(`Bob ${filename} ${eventType} v`, v)
    context.state.handle(v)
  }
});

function handle_stateCynBobDeal (eotx) { // {{{1
  if (eotx.txId && eotx.txId === stateCynBobDeal.txId) { // effect follows the tx
    context.opts.log('Bob handle_stateCynBobDeal eotx', eotx, 'clawback', stateCynBobDeal.amount)

    stateCynBobDeal.resolve()
  } else {                                               // tx
    let desc = txDesc(eotx)
    context.opts.log('Bob handle_stateCynBobDeal desc', desc)

    stateCynBobDeal.amount = desc.amount
    stateCynBobDeal.txId = desc.txId
    return stateCynBobDeal.promise;
  }
}

function handle_stateInitial (e) { // {{{1
  if (!e) {
    return;
  }
  if (e.txMemo == 'Offer 0' && !stateInitial.txId) {
    context.opts.log('Bob handle_stateInitial e', e)

    stateInitial.txId = e.txId
    context.opts.makerBalanceId = e.balance_id
  }
  if (stateInitial.txId == e.txMemo && !stateInitial.deal) {
    context.opts.log('Bob handle_stateInitial e', e)

    context.opts.e = e
    let dealTakeOffer = context.opts.sdk.transaction.dealTakeOffer
    return (stateInitial.deal = dealTakeOffer(context.opts)).then(deal => {
      context.state = stateCynBobDeal
      stateInitial.resolve(deal)
    });
  }
}

function fcrs (sdk, opts) { // Offer freshly caught red snapper. {{{1
  opts.sdk ??= sdk

  opts.description = 'Freshly caught red snapper 4lb. HEXA 800'
  opts.validity = '0'
  context.opts = opts
  return makeOffer(opts).then(_ => stateInitial.promise).
  then(deal => context.state.handle(deal)).then(_ => watcher.close());
}

export { fcrs, } // {{{1

