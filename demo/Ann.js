import { HEX_KEY, makeRequest, } from '../lib/api.js' // {{{1
import { Context, } from '../lib/util.js'
import vault from '../lib/vault.js'

let stateInitial = { // {{{1
  handle: handle_stateInitial,
}, stateCynAnnDeal = { // {{{1
  handle: handle_stateCynAnnDeal,
}
Object.assign(stateInitial, Promise.withResolvers())

let context = new Context(stateInitial, 'Ann') // {{{1

let watcher = vault.watch(null, (eventType, filename) => { // {{{1
  if (filename.startsWith('Issuer.desc.')) {
    let v = vault.get(filename)
    //console.log(`${filename} file changed! Event type: ${eventType}`, v)
    if (context.state === stateInitial) {
      handle_stateInitial(v)
    }
  }
});

function handle_stateCynAnnDeal (e) { // {{{1
  this.log('Ann handle_stateCynAnnDeal e', e)

  return Promise.resolve(e);
}

function handle_stateInitial (e) { // {{{1
  console.log('Ann handle_stateInitial e', e)

  if (e.txMemo == 'Request 0' && !stateInitial.txId) {
    stateInitial.txId = e.txId
  }
  if (stateInitial.txId == e.txMemo) {
    watcher.close()
    context.state = stateCynAnnDeal
    stateInitial.resolve(e)
  }
}

function rs4d (sdk, opts) { // Request red snapper for dinner. {{{1
  opts.sdk ??= sdk

  opts.description = 'Fresh red snapper for 4 persons GGS. HEXA 1000'
  opts.validity = '0'
  return makeRequest(opts).then(_ => stateInitial.promise).
  then(takingRequest => context.state.handle.call(opts, takingRequest));
}

export { rs4d, } // {{{1

