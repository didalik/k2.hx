// API is for users; SDK is for devs. This is hX SDK, still public. {{{1
import {
  Asset, Keypair, Horizon, MemoHash, MemoText, Networks, TransactionBuilder,
} from '@stellar/stellar-sdk'

let sdk // {{{1

let handler = {
  sdk: { 
    get(...args) {return args[1] in args[0] ? Reflect.get(...args) : known_sdk(...args);},
    server: {
      get(...args) { // {{{2
        //console.log('handler.sdk.server.get args', args)

        switch (args[1]) {
          case 'loadAccount': {
            let f = args[1] in args[0] ? Reflect.get(...args) : known_sdk_server(...args)
            return function(...parms) {
              return f.apply(this === args[2] ? args[0] : this, parms);
            }
          }
          case 'server': {
            return /*args[1] in args[0] ?*/ Reflect.get(...args)/* : known_sdk_server(...args)*/;
          }
        }
      },
      opts4loadAccount: { // {{{2
        get(...args) {return args[1] in args[0] ? Reflect.get(...args) : known_sdk_server_opts4loadAccount(...args);},
        accountId: {
          get(...args) {return args[1] in args[0] ? Reflect.get(...args) : known_sdk_server_opts4loadAccount_accountId(...args);},
        },
      }, // }}}2
    },
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

function inject_accountId (opts) { // {{{1
  console.log('inject_accountId this', this, 'opts', opts)

  return this.value = 'XA';
}

function known_sdk (target, prop) { // {{{1
  switch (prop) {
    case 'server': {
      let url = target.networkPassphrase == Networks.PUBLIC ? 'https://horizon.stellar.org' :
        target.networkPassphrase == Networks.TESTNET ? 'https://horizon-testnet.stellar.org' : null
      target[prop] = new Proxy(
        { 
          opts4loadAccount: new Proxy({}, handler.sdk.server.opts4loadAccount),
          server: new Horizon.Server(url)
        }, 
        handler.sdk.server
      )
      //console.log('known_sdk sdk', sdk)

      return target[prop];
    }
  }
}

function known_sdk_server (target, prop) { // {{{1
  //console.log('known_sdk_server prop', prop, 'sdk', sdk)

  switch (prop) {
    case 'loadAccount': {
      target[prop] = known_sdk_server_loadAccount

      return target[prop];
    }
  }
}

function known_sdk_server_loadAccount (opts = this.opts4loadAccount) { // {{{1
  console.log('known_sdk_server_loadAccount opts.accountId.value', opts.accountId.inject_accountId(opts), 'opts', opts)

  return opts.accountId.value;
/*
  return opts.accountId ? this.server.loadAccount(opts.accountId)
    : opts.creator ? // but first, run this tX: use opts.creator.{destination,startingBalance,source) and createAccount opts.accountId
    : // but first, create the creator account (TESTNET only)

  In other words, opts.accountId ==> opts.creator.{destination,startingBalance,source) ==> opts.creator 
*/
}

function known_sdk_server_opts4loadAccount (target, prop) { // {{{1
  switch (prop) {
    case 'creator': {
      return target[prop] = new Proxy(
        {
          destination: new Proxy({ injector_destinaation }, handler.sdk.server.opts4loadAccount.creator.destination),
          source: new Proxy({ injector_source }, handler.sdk.server.opts4loadAccount.creator.source),
          startingBalance: new Proxy({ injector_startingBalance }, handler.sdk.server.opts4loadAccount.creator.startingBalance),
        },
        handler.sdk.server.opts4loadAccount.creator
      );
    }
    case 'accountId': {
      return target[prop] = new Proxy({ inject_accountId }, handler.sdk.server.opts4loadAccount.accountId);
    }
  }
}

function known_sdk_server_opts4loadAccount_accountId (target, prop) { // {{{1
  console.log('known_sdk_server_opts4loadAccount_accountId target', target, 'prop', prop)

}

export { hXsdk, } // {{{1

