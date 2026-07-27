import { Context, } from '../lib/util.js' // {{{1
import { makeOffer, txDesc, } from '../lib/api.js'
let vault, watcher

let stateInitial = { // {{{1
  handle: handle_stateInitial,
}, stateCynBobDeal = { // {{{1
  handle: handle_stateCynBobDeal,
}
Object.assign(stateInitial, Promise.withResolvers())
Object.assign(stateCynBobDeal, Promise.withResolvers())

let context = new Context(stateInitial, 'Bob') // {{{1

function handle_stateCynBobDeal (eotx) { // {{{1
  if (eotx.txId && eotx.txId === stateCynBobDeal.txId) { // effect follows the tx
    context.opts.log('Bob handle_stateCynBobDeal eotx', eotx, 'clawable', stateCynBobDeal.amount)

    delete stateCynBobDeal.txId
    context.opts.sdk.transaction.closeDeal(context.opts).
      then(_ => stateCynBobDeal.resolve())
  } else if (!stateCynBobDeal.amount) {                    // tx
    let desc = txDesc(eotx)
    context.opts.log('Bob handle_stateCynBobDeal desc', desc)

    context.opts.amount = stateCynBobDeal.amount = desc.amount
    context.opts.dealTxId = stateCynBobDeal.txId = desc.txId
    context.opts.from = desc.destination
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
  vault ??= sdk.vault
  watcher = vault.watch(null, (eventType, filename) => {
    if (filename.startsWith('Issuer.desc.')) {
      let v = vault.get(filename)
      context.state.handle(v)
    }
  });
  opts.description = 'Freshly caught red snapper 4lb. HEXA 800'
  opts.validity = '0'
  context.opts = opts
  return makeOffer(opts).then(_ => stateInitial.promise).
  then(deal => context.state.handle(deal)).then(_ => watcher.close());
}

export { fcrs, } // {{{1

