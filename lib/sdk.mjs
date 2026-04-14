// API is for users; SDK is for devs. This is hX SDK, still public. {{{1
import {
  Asset, Keypair, Horizon, MemoHash, MemoText, Networks, TransactionBuilder,
} from '@stellar/stellar-sdk'

let sdk // {{{1

let handler = {
  sdk: { 
    get(...args) {return args[1] in args[0] ? Reflect.get(...args) : known_sdk(...args);},
    server: {
      get(...args) {
        //console.log('handler.sdk.server.get args', args)

        switch (args[1]) {
          case 'loadAccount': {
            let f = args[1] in args[0] ? Reflect.get(...args) : known_sdk_server(...args)
            return function(...parms) {
              return f.apply(this === args[2] ? args[0] : this, parms);
            }
          }
          case 'server': {
            return args[1] in args[0] ? Reflect.get(...args) : known_sdk_server(...args);
          }
        }
      },
    },
  },
}

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
  if (sdk) {
    return sdk; // a proxy to target
  }
  return sdk = new Proxy(target, handler.sdk);
}

function known_sdk (target, prop) { // {{{1
  switch (prop) {
    case 'server': {
      let url = target.networkPassphrase == Networks.PUBLIC ? 'https://horizon.stellar.org' :
        target.networkPassphrase == Networks.TESTNET ? 'https://horizon-testnet.stellar.org' : null
      target[prop] = new Proxy({ server: new Horizon.Server(url) }, handler.sdk.server)
      //console.log('known_sdk sdk', sdk)

      return target[prop];
    }
  }
}

function known_sdk_server (target, prop) { // {{{1
  console.log('known_sdk_server prop', prop, 'sdk', sdk)
  switch (prop) {
    case 'loadAccount': {
      target[prop] = known_sdk_server_loadAccount

      return target[prop];
    }
  }
}

function known_sdk_server_loadAccount (opts) { // {{{1
  console.log('known_sdk_server_loadAccount opts', opts, 'this', this)

  return opts.optA;
}

export { hXsdk, } // {{{1

