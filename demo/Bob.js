import vault from '../lib/vault.js' // {{{1
import { Context, } from '../lib/util.js'
import { makeOffer, } from '../lib/api.js'

let stateInitial = { // {{{1
  handle: handle_stateInitial,
}, stateCynBobDeal = { // {{{1
  handle: handle_stateCynBobDeal,
}
Object.assign(stateInitial, Promise.withResolvers())

let context = new Context(stateInitial, 'Bob') // {{{1

let watcher = vault.watch(null, (eventType, filename) => { // {{{1
  if (filename.startsWith('Issuer.desc.')) {
    let v = vault.get(filename)
    //console.log(`Bob ${filename} ${eventType} v`, v)
    context.state.handle(v)
  }
});

function handle_stateCynBobDeal (e) { // {{{1
  context.opts.log('Bob handle_stateCynBobDeal e', e)

  watcher.close()
  return Promise.resolve(e);
}

function handle_stateInitial (e) { // {{{1
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
  then(deal => context.state.handle(deal));
}

export { fcrs, } // {{{1

