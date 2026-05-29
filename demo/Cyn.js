import vault from '../lib/vault.js' // {{{1
import { Context, } from '../lib/util.js'

let stateInitial = { // {{{1
  handle: handle_stateInitial,
}/*, stateCynAnnDeal = { // {{{1
  handle: handle_stateCynAnnDeal,
}*/
Object.assign(stateInitial, Promise.withResolvers())

let context = new Context(stateInitial, 'Cyn') // {{{1

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

function handle_stateInitial (e) { // {{{1
  this.log('handle_stateInitial e', e)

  /*if (desc.amount == HEX_KEY && desc.txDesc == '') {
    this.context.state = stateCynAnnDeal
    return stateInitial.resolve(desc);
  }*/
  return Promise.resolve();
}

