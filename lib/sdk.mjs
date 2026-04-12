// API is for users; SDK is for devs. This is hX SDK, still public. {{{1
import {
  Asset, Keypair, Horizon, MemoHash, MemoText, Networks, TransactionBuilder,
} from '@stellar/stellar-sdk'

let kMap = new Map() // {{{1
kMap.set(Networks.PUBLIC + 'server', kserver)
kMap.set(Networks.TESTNET + 'server', kserver)
let koMap = new Map()
koMap.set(Networks.PUBLIC + 'server', {
  networkPassphrase: Networks.PUBLIC,
  url: 'https://horizon.stellar.org'
})
koMap.set(Networks.TESTNET + 'server', {
  networkPassphrase: Networks.TESTNET,
  url: 'https://horizon-testnet.stellar.org'
})
let kpMap = new Map()
kpMap.set(
  JSON.stringify({ target: { networkPassphrase: Networks.PUBLIC }, prop: 'server' }),
  Networks.PUBLIC + 'server'
)
kpMap.set(
  JSON.stringify({ target: { networkPassphrase: Networks.TESTNET }, prop: 'server' }),
  Networks.TESTNET + 'server'
)
//console.log('kpMap', kpMap)

let sdkMap = new Map() // {{{1
const add = (prop, target) => {
  let kp = kpMap.get(JSON.stringify({ target, prop }))
  //console.log('add prop', prop, 'target', target, 'kp', kp)

  target[prop] = kMap.get(kp)(koMap.get(kp))
  return target[prop];
}
let handler = {
  get(target, prop, receiver) {
    //console.log('handler.get target', target, 'prop', prop, 'receiver', receiver)

    return prop in target ? Reflect.get(...arguments) : add(prop, target)
  },
};

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
  let sdk = sdkMap.get(networkPassphrase), target = { networkPassphrase }
  if (sdk) {
    return sdk; // a proxy to target
  }
  let proxy = new Proxy(target, handler)
  sdkMap.set(networkPassphrase, proxy)
  //console.log('hXsdk updated sdkMap', sdkMap)

  return proxy;
}

function kserver (opts) { // {{{1
  return {
    networkPassphrase: opts.networkPassphrase,
    server: new Horizon.Server(opts.url),
  };
}

export { hXsdk, } // {{{1

