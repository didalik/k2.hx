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
    console.log(`${filename} file changed! Event type: ${eventType}`, v)
    if (v) {
      watcher.close()
    }
    if (context.state === stateInitial) {
      stateInitial.resolve(v)
    }
  }
});

function handle_stateCynAnnDeal (e) { // {{{1
  this.log('handle_stateCynAnnDeal e', e)

  return Promise.resolve(e);
}

function handle_stateInitial (e) { // {{{1
  this.log('handle_stateInitial e', e)

  /*if (desc.amount == HEX_KEY && desc.txDesc == '') {
    this.context.state = stateCynAnnDeal
    return stateInitial.resolve(desc);
  }*/
  return Promise.resolve();
}

function rs4d (sdk, opts) { // Request red snapper for dinner. {{{1
  opts.sdk ??= sdk
  opts.description = 'Fresh red snapper for 4 persons GGS. HEXA 1000'
  opts.validity = '0'
  return makeRequest(opts).then(_ => stateInitial.promise).
  then(takingRequest => context.state.handle.call(opts, takingRequest));
}

export { rs4d, } // {{{1

