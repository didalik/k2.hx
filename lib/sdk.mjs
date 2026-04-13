// API is for users; SDK is for devs. This is hX SDK, still public. {{{1
import {
  Asset, Keypair, Horizon, MemoHash, MemoText, Networks, TransactionBuilder,
} from '@stellar/stellar-sdk'

let root = { path: '', name: 'root' } // {{{1

let handler_sdk = {
  get(target, prop, receiver) {
    return prop in target ? Reflect.get(...arguments) : known_sdk(prop, target)
  },
};
let handler_sdk_server = {
  get(target, prop, receiver) {
    return prop in target ? Reflect.get(...arguments) : known_sdk_server(prop, target)
  },
};
let handler_sdk_server_loadAccount

/** function hXsdk (opts = null) { // {{{1
 * This function returns an object that supports KNOWN properties. You can access a KNOWN
 * property even if it does not yet exist in such an object - if the property is KNOWN to
 * this function, it is being added to the object.
 *
 * @param {object} opts.
 * @todo Use opts.
 * @returns proxy to an object with KNOWN properties.
 */
function hXsdk (opts = null) {
  let networkPassphrase = Networks.TESTNET
  if (process?.env?.Networks_PUBLIC) {
    if (process.env.Networks_PUBLIC == 'hX') {
      networkPassphrase = Networks.PUBLIC
    } else {
      throw Error(`Invalid process.env.Networks_PUBLIC ${process.env.Networks_PUBLIC}`)
    }
  }
  let target = { networkPassphrase }
  if (root.sdk) {
    return root.sdk; // a proxy to target
  }
  return root.sdk = new Proxy(target, handler_sdk);
}

function known_sdk (prop, target) { // {{{1
  let url = target.networkPassphrase == Networks.PUBLIC ? 'https://horizon.stellar.org' :
    target.networkPassphrase == Networks.TESTNET ? 'https://horizon-testnet.stellar.org' : null
  target[prop] = new Proxy({ server: new Horizon.Server(url) }, handler_sdk_server)
  console.log('known_sdk root', root)

  return target[prop];
}

function known_sdk_server (prop, target) { // {{{1
  target[prop] = new Proxy(
    { networkPassphrase: root.sdk.networkPassphrase}, 
    handler_sdk_server_loadAccount
  )
  console.log('known_sdk root', root)

  return target[prop];
}

export { hXsdk, } // {{{1

