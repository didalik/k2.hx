// API is for users; SDK is for devs. This is hX SDK, still public. {{{1
import { 
  //Asset, Keypair, 
  Horizon, 
  //MemoHash, MemoText, 
  Networks, 
  TransactionBuilder,
} from '@stellar/stellar-sdk'
import server from './server.js'
import transaction from './transaction.js'

let map = {}, sdk; const handler = { // {{{1
  sdk: { 
    get(...args) {
      return args[1] in args[0] ? Reflect.get(...args) : known_sdk(...args);
    },
    server,
    transaction,
  },
}

function addStream (opts, tag, types, id, now = false) { // {{{1
  //console.log('addStream opts', opts, 'tag', tag, 'types', types, 'id', id, 'now', now)

  let { streams, } = opts
  map[id] ??= []
  map[id].push({ opts, types })
  let effects4account = sdk.server.server.effects().forAccount(id)
  if (now) {
    effects4account = effects4account.cursor('now')
  }
  let close = effects4account.stream({
    onerror:   e => { close(); throw e; },
    onmessage: e => map[id].forEach(v => {
      let pair = v.types.find(p => p[0] == e.type)
      if (!pair) {
        return;
      }
      pair[1].call(v.opts, e)
    })
  })
  streams.push({ close, id, tag, })
}

/** function hXsdk (opts = {}) { // {{{1
 * This function returns an object that supports KNOWN properties. You can access a KNOWN
 * property even if it does not yet exist in such an object - if the property is KNOWN,
 * it is being added to the object.
 *
 * @param {object} opts.
 * @returns proxy to an object with KNOWN properties.
 */
function hXsdk (opts = {}) {
  let networkPassphrase = Networks.TESTNET
  if (process?.env?.Networks_PUBLIC) {
    if (process.env.Networks_PUBLIC == 'hX') {
      networkPassphrase = Networks.PUBLIC
    } else {
      throw Error(`Invalid process.env.Networks_PUBLIC ${process.env.Networks_PUBLIC}`)
    }
  }
  let target = Object.assign({ addStream, networkPassphrase, sign, }, opts)
  return sdk = new Proxy(target, handler.sdk);
}

function known_sdk (target, prop) { // server|transaction {{{1
  switch (prop) {
    case 'server': {
      let url = target.networkPassphrase == Networks.PUBLIC ? 'https://horizon.stellar.org'
      : target.networkPassphrase == Networks.TESTNET ? 'https://horizon-testnet.stellar.org'
      : null

      target[prop] = new Proxy(
        { sdk, server: new Horizon.Server(url) }, 
        handler.sdk.server
      )
      return target[prop];
    }
    case 'transaction': {
      target[prop] = new Proxy({ sdk, }, handler.sdk.transaction)
      return target[prop];
    }
  }
}

function sign (kp, xdr, tag) { // {{{1
  //console.log('sign sdk', sdk, 'xdr', xdr, 'tag', tag)

  if (!sdk.transaction[tag]({ signXDR: true, kp, xdr })) {
    return Promise.reject(new Error(`sign tag ${tag}`));
  }
  let tx = TransactionBuilder.fromXDR(xdr, sdk.networkPassphrase)
  tx.sign(kp)
  return Promise.resolve(tx.toXDR());
}

export { hXsdk, } // {{{1

