import vault from '../lib/vault.js' // {{{1
import { HEX_KEY, parseHEXA, takeOffer, takeRequest, } from '../lib/api.js'
import { Context, } from '../lib/util.js'

let stateInitial = { // {{{1
  handle: handle_stateInitial,
}, stateDeals = { // {{{1
  handle: handle_stateDeals,
}
Object.assign(stateInitial, {
  offer: Promise.withResolvers(), request: Promise.withResolvers(), queue: [],
})
Object.assign(stateDeals, {
  offer: Promise.withResolvers(), request: Promise.withResolvers(),
})

let context = new Context(stateInitial, 'Cyn') // {{{1

let watcher = vault.watch(null, (eventType, filename) => { // {{{1
  if (filename.startsWith('Issuer.desc.')) {
    context.state.handle(vault.get(filename))
  }
});

function handle_stateDeals (e) { // {{{1
  if (e.txMemoType != 'return') {
    return;
  }
  if (e.amount != HEX_KEY && !stateDeals.offer_deal) { // FIXME
    context.opts.log('Cyn handle_stateDeals Offer e', e)

    stateDeals.offer_deal = true
    stateDeals.offer.resolve(e)
  } else if (e.amount == HEX_KEY && !stateDeals.request_deal) {
    context.opts.log('Cyn handle_stateDeals Request e', e)

    stateDeals.request_deal = true
    stateDeals.request.resolve(e)
  }
}

function handle_stateInitial (e) { // {{{1
  if (!context.opts) {
    stateInitial.queue.push(e)
    return;
  }
  for (let effect of stateInitial.queue) {
    handle_stateInitial(effect)
  }
  if (e?.txMemo?.startsWith('Offer') && !stateInitial.offer.received) {
    context.opts.log('Cyn handle_stateInitial Offer e', e)

    stateInitial.offer.received = e
    stateInitial.offer.resolve(e)
  } else if (e?.txMemo?.startsWith('Request') && !stateInitial.request.received) {
    context.opts.log('Cyn handle_stateInitial Request e', e)

    stateInitial.request.received = e
    stateInitial.request.resolve(e)
  }
}

function run (sdk, opts) { // {{{1
  opts.sdk ??= sdk

  opts.validity = '0'
  context.opts = opts
  return Promise.all([stateInitial.offer.promise, stateInitial.request.promise]).then(_ => {
    let offer = stateInitial.offer.received, request = stateInitial.request.received
    context.state = stateDeals
    return take(opts, offer).then(takingOffer => take(opts, request, takingOffer));
  }).then(_ => {
    return Promise.all([stateDeals.offer.promise, stateDeals.request.promise]);
  }).then(_ => watcher.close());
}

function take (opts, effect, takingOffer = null) { // {{{1
  opts.log('Cyn take effect', effect)//, 'opts', opts)

  opts.amount = parseHEXA(effect.txDesc)
  opts.makeTxId = effect.txId
  let taking = effect.txMemo.startsWith('Offer') ? takeOffer : takeRequest
  return taking(opts).then(r => takingOffer ?? r);
}

export { run, } // {{{1

