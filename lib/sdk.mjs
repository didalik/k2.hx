// API is for users; SDK is for devs. This is hX SDK, still public. {{{1
import { 
  //Asset, Keypair, 
  Horizon, 
  //MemoHash, MemoText, 
  Networks, 
  //TransactionBuilder,
} from '@stellar/stellar-sdk'
import server from './server.js'

let sdk // {{{1

const handler = {
  sdk: { 
    get(...args) {return args[1] in args[0] ? Reflect.get(...args) : known_sdk(...args);},
    server,
  },
}

/** function hXsdk (opts = null) { // {{{1
 * This function returns an object that supports KNOWN properties. You can access a KNOWN
 * property even if it does not yet exist in such an object - if the property is KNOWN,
 * it is being added to the object.
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
  if (sdk) {
    return sdk; // a proxy to target
  }
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
      //console.log('known_sdk sdk', sdk)

      return target[prop];
    }
  }
}

export { hXsdk, } // {{{1

