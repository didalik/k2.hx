import { // {{{1
  //Asset,
  Keypair,
  //Horizon, MemoHash, MemoText,
  Networks, 
  //TransactionBuilder,
} from '@stellar/stellar-sdk'

let sdk; const server = { // handlers {{{1
  get(...args) { // {{{2
    switch (args[1]) {
      case 'loadAccount': {
        let f = args[1] in args[0] ? Reflect.get(...args) : known(...args)
        return function(...parms) {
          //console.log('server.get loadAccount started parms', parms)

          return f.apply(this === args[2] ? args[0] : this, parms);
        }
      }
      default: {
        //console.log('server.get args', args)

        return Reflect.get(...args);
      }
    }
  },
  opts4loadAccount: { // {{{2
    get(...args) { // {{{3
      return args[1] in args[0] ? Reflect.get(...args) : known_opts4loadAccount(...args);
    },
  },
  // }}}2
}

function injectAccount (opts) { // {{{1
  console.log('injectAccount - creating creator...')

  let creator
  opts.creator.then(_creator => {
    creator = _creator
    let CREATOR_PK = creator.keypair.publicKey()
    console.log(`- loading creator.account ${creator.keypair.publicKey()} ...`)

    return sdk.server.server.loadAccount(CREATOR_PK);
  }).then(creatorAccount => {
    creator.account = creatorAccount

    // Create account with new Keypair, startingBalance XLM 1000; see also inject_defaults
    let account = sdk.server.opts4loadAccount.account
    account.keypair = Keypair.random()
    account.startingBalance = '1000' // asset_type native
    return sdk.transaction.createAccount({ account, creator });
  })
}

function known (target, prop) { // {{{1
  target[prop] = loadAccount
  //console.log('known prop', prop, 'target', target)

  return target[prop];
}

function known_opts4loadAccount (target, prop) { // {{{1
  //console.log('known_opts4loadAccount target', target, 'prop', prop)

  switch (prop) {
    case 'account': { // {{{2
      target[prop] = Promise.withResolvers()
      injectAccount(sdk.server.opts4loadAccount)
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
    }
    case 'opts4creator': { // {{{2
      //console.log('known_opts4loadAccount NOOP, the prop "', prop, '" is being set')

    }
    // }}}2
  }
}

function loadAccount (opts) { // {{{1
  sdk = this.sdk
  this.opts4loadAccount = new Proxy(opts, server.opts4loadAccount)
  console.log('loadAccount opts', opts, '- accessing opts.account...')

  return this.opts4loadAccount.account.promise.
    then(accountId => {
      console.log('loadAccount accountId', accountId, '- loading...')
      return this.server.loadAccount(accountId)
    }).then(r => {
      console.log(r)
      return Promise.resolve('XA');
    });
/*
  return opts.accountId ? this.server.loadAccount(opts.accountId)
    : opts.creator ? // but first, run sdk.transaction.createAccount(opts.accountId, opts.creator.{destination,startingBalance,source})
    : // but first, create the creator account (TESTNET only) and set opts.creator.keypair

  In other words, opts.accountId ==> opts.creator.{destination,startingBalance,source} ==> opts.creator 
*/
}

export default server // {{{1

