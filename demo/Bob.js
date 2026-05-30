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
    if (context.state === stateInitial) {
      handle_stateInitial(v)
    }
  }
});

function handle_stateCynBobDeal (e) { // {{{1
  this.log('Bob handle_stateCynBobDeal e', e)

  return Promise.resolve(e);
}

function handle_stateInitial (e) { // {{{1
  if (e.txMemo == 'Offer 0' && !stateInitial.txId) {
    console.log('Bob handle_stateInitial e', e)

    stateInitial.txId = e.txId
  }
  if (stateInitial.txId == e.txMemo) {
    console.log('Bob handle_stateInitial e', e)

    watcher.close()
    context.state = stateCynBobDeal
    stateInitial.resolve(e)
  }
}

function fcrs (sdk, opts) { // Offer freshly caught red snapper. {{{1
  opts.sdk ??= sdk

  opts.description = 'Freshly caught red snapper 4lb. HEXA 800'
  opts.validity = '0'
  return makeOffer(opts).then(_ => stateInitial.promise).
  then(takingOffer => context.state.handle.call(opts, takingOffer));
}

export { fcrs, } // {{{1

