import { // {{{1
  //Asset,
  Keypair,
  //Horizon, MemoHash, MemoText,
  TransactionBuilder,
} from '@stellar/stellar-sdk'

let sdk; const transaction = { // handlers {{{1
  get(...args) { // {{{2
    switch (args[1]) {
      case 'createAccount': {
        let f = args[1] in args[0] ? Reflect.get(...args) : known(...args)
        return function(...parms) {
          //console.log('transaction.get createAccount started parms', parms)

          return f.apply(this === args[2] ? args[0] : this, parms);
        }
      }
      default: {
        //console.log('transaction.get args', args)

        return Reflect.get(...args);
      }
    }
  },
  opts4createAccount: { // {{{2
    get(...args) { // {{{3
      return args[1] in args[0] ? Reflect.get(...args) : known_opts4createAccount(...args);
    },
  },
  // }}}2
}

function createAccount (opts) { // {{{1
  sdk = this.sdk
  this.opts4createAccount = new Proxy(opts, transaction.opts4createAccount)
  console.log('createAccount opts', opts, '- accessing opts.accountId...')

  return this.opts4createAccount.accountId.promise.then(accountId => this.transaction.createAccount(accountId));
/*
  return opts.accountId ? this.server.loadAccount(opts.accountId)
    : opts.creator ? // but first, run sdk.transaction.createAccount(opts.accountId, opts.creator.{destination,startingBalance,source})
    : // but first, create the creator account (TESTNET only) and set opts.creator.keypair

  In other words, opts.accountId ==> opts.creator.{destination,startingBalance,source} ==> opts.creator 
*/
}

function known (target, prop) { // {{{1
  target[prop] = createAccount
  //console.log('known prop', prop, 'target', target)

  return target[prop];
}

function known_opts4createAccount (target, prop) { // {{{1
  console.log('known_opts4createAccount target', target, 'prop', prop)

  switch (prop) {
    case 'accountId': { // {{{2
      target[prop] = Promise.withResolvers()
      inject_accountId(sdk.server.opts4createAccount)
      return target[prop];
    }
    case 'creator': { // {{{2
      if (sdk.networkPassphrase !== Networks.TESTNET) {
        throw Error('You MUST supply creator')
      }
      let opts = sdk.server.opts4creator ??= sdk.server.opts4loadAccount.opts4creator ?? {}
      opts.keypair ??= Keypair.random()
      //console.log('known_opts4loadAccount sdk', sdk, '- creating creator...')

      let CREATOR_PK = opts.keypair.publicKey()
      return fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(CREATOR_PK)}`).
      then(response => response.json()).then(_ => (target[prop] = { keypair: opts.keypair }, target[prop])).
      catch(e => e);
/*
      return target[prop] = new Proxy(
        {
          createAccount: new Proxy(createAccount, server.opts4loadAccount.creator.createAccount),
          destination: new Proxy({ inject_destination }, server.opts4loadAccount.creator.destination),
          source: new Proxy({ inject_source }, server.opts4loadAccount.creator.source),
          startingBalance: new Proxy({ inject_startingBalance }, server.opts4loadAccount.creator.startingBalance),
        },
        server.opts4loadAccount.creator
      );*/
    }
    case 'opts4creator': { // {{{2
      //console.log('known_opts4loadAccount NOOP, the prop "', prop, '" is being set')

    }
    // }}}2
  }
}

export default transaction // {{{1

