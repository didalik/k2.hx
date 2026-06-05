import { HEX_KEY, makeRequest, txDesc, } from '../lib/api.js' // {{{1
import { Context, } from '../lib/util.js'
import vault from '../lib/vault.js'

let stateInitial = { // {{{1
  handle: handle_stateInitial,
}, stateCynAnnDeal = { // {{{1
  handle: handle_stateCynAnnDeal,
}
Object.assign(stateInitial, Promise.withResolvers())
Object.assign(stateCynAnnDeal, Promise.withResolvers())

let context = new Context(stateInitial, 'Ann') // {{{1

let watcher = vault.watch(null, (eventType, filename) => { // {{{1
  if (filename.startsWith('Issuer.desc.')) {
    let v = vault.get(filename)
    //console.log(`${filename} file changed! Event type: ${eventType}`, v)
    context.state.handle(v)
  }
});

function handle_stateCynAnnDeal (eotx) { // {{{1
  if (eotx.txId && eotx.txId === stateCynAnnDeal.txId) { // effect follows the tx
    context.opts.log('Ann handle_stateCynAnnDeal eotx', eotx, 'clawback', stateCynAnnDeal.amount)

    stateCynAnnDeal.resolve()
  } else {                                               // tx
    let desc = txDesc(eotx)
    stateCynAnnDeal.amount = desc.amount
    stateCynAnnDeal.txId = desc.txId
    //context.opts.log('Ann handle_stateCynAnnDeal stateCynAnnDeal', stateCynAnnDeal)

    return stateCynAnnDeal.promise;
  }
}

function handle_stateInitial (e) { // {{{1
  if (!e) {
    return;
  }
  if (e.txMemo == 'Request 0' && !stateInitial.txId) {
    context.opts.log('Ann handle_stateInitial e', e)

    stateInitial.txId = e.txId
    context.opts.r_amount = e.amount
    context.opts.r_balanceId = e.balance_id
  }
  if (stateInitial.txId == e.txMemo && !stateInitial.deal) {
    context.opts.log('Ann handle_stateInitial e', e)

    context.opts.e = e
    let dealTakeRequest = context.opts.sdk.transaction.dealTakeRequest
    return (stateInitial.deal = dealTakeRequest(context.opts)).then(deal => {
      context.state = stateCynAnnDeal
      stateInitial.resolve(deal)
    });
  }
}

function rs4d (sdk, opts) { // Request red snapper for dinner. {{{1
  opts.sdk ??= sdk

  opts.description = 'Fresh red snapper for 4 persons GGS. HEXA 1000'
  opts.validity = '0'
  context.opts = opts
  return makeRequest(opts).then(_ => stateInitial.promise).
  then(deal => context.state.handle(deal)).then(_ => watcher.close());
}

export { rs4d, } // {{{1

