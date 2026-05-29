import vault from '../lib/vault.js' // {{{1
import { parseHEXA, takeOffer, takeRequest, } from '../lib/api.js'
import { Context, } from '../lib/util.js'

let stateInitial = { // {{{1
  handle: handle_stateInitial,
}/*, stateCynAnnDeal = { // {{{1
  handle: handle_stateCynAnnDeal,
}*/
Object.assign(stateInitial, {
  offer: Promise.withResolvers(), request: Promise.withResolvers(),
})

let context = new Context(stateInitial, 'Cyn') // {{{1

let watcher = vault.watch(null, (eventType, filename) => { // {{{1
  if (filename.startsWith('Issuer.desc.')) {
    context.state.handle(vault.get(filename))
  }
});

function handle_stateInitial (e) { // {{{1
  console.log('Cyn handle_stateInitial e', e)

  if (e.txMemo.startsWith('Offer') && !stateInitial.offer.received) {
    stateInitial.offer.received = e
    stateInitial.offer.resolve(e)
  } else if (!stateInitial.request.received) {
    stateInitial.request.received = e
    stateInitial.request.resolve(e)
  }
}

function run (opts) { // {{{1
  opts.validity = '0'
  return Promise.all([stateInitial.offer.promise, stateInitial.request.promise]).then(_ => {
    let offer = stateInitial.offer.received, request = stateInitial.request.received
    return take(opts, offer).then(takingOffer => take(opts, request, takingOffer));
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

