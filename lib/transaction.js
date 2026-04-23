import { // {{{1
  //Asset,
  AuthClawbackEnabledFlag, AuthRevocableFlag, BASE_FEE,
  Keypair,
  //Horizon, MemoHash, MemoText,
  Operation, TransactionBuilder,
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
  sdk = this.sdk // this === sdk.transaction
  this.opts4createAccount ??= new Proxy(opts, transaction.opts4createAccount)
  let defaults = this.opts4createAccount.defaults
  let destination = opts.account.keypair.publicKey()
  let startingBalance = opts.account.startingBalance
  let tx = new TransactionBuilder(opts.creator.account, { fee: BASE_FEE }).
    addOperation(Operation.createAccount({ destination, startingBalance })).
    addOperation(Operation.setOptions(defaults.opts)).
    setNetworkPassphrase(sdk.networkPassphrase).
    setTimeout(30).build();
  tx.sign(opts.creator.keypair) //, opts.account.keypair)
  console.log(`createAccount - creating account ${destination}...`)

  return sdk.server.server.submitTransaction(tx).
    then(r => opts.account.resolve(destination)).
    catch(e => console.error('*** ERROR ***', e.response.data.extras.result_codes));
}

function inject_defaults (opts) { // for HEXA issuer {{{1
  //console.log('inject_defaults this', this, 'opts', opts)

  return {
    opts: { // for Operation.setOptions
      homeDomain: 'hx.kloudoftrust.org',
      setFlags: AuthClawbackEnabledFlag | AuthRevocableFlag,
      source: opts.creator.keypair.publicKey(),
    },
  };
}

function known (target, prop) { // {{{1
  target[prop] = createAccount
  //console.log('known prop', prop, 'target', target)

  return target[prop];
}

function known_opts4createAccount (target, prop) { // {{{1
  //console.log('known_opts4createAccount target', target, 'prop', prop)
  //console.log('known_opts4createAccount prop', prop)

  return target[prop] = inject_defaults(target);
}

export default transaction // {{{1

