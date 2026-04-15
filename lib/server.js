/*import { // {{{1
  Asset, Keypair, Horizon, MemoHash, MemoText, Networks, TransactionBuilder,
} from '@stellar/stellar-sdk'
*/
const server = { // {{{1
  get(...args) { // {{{2
    //console.log('server.get args', args)

    switch (args[1]) {
      case 'loadAccount': {
        let f = args[1] in args[0] ? Reflect.get(...args) : known(...args)
        return function(...parms) {
          return f.apply(this === args[2] ? args[0] : this, parms);
        }
      }
      case 'server': {
        return Reflect.get(...args);
      }
    }
  },
  opts4loadAccount: { // {{{2
    get(...args) {return args[1] in args[0] ? Reflect.get(...args) : known_opts4loadAccount(...args);},
    accountId: {
      get(...args) {
        return args[1] in args[0] ? Reflect.get(...args) : known_opts4loadAccount_accountId(...args);
      },
    },
  }, // }}}2
}

function inject_accountId (opts) { // {{{1
  console.log('inject_accountId this', this, 'opts', opts)

  return this.value = 'XA';
}

function known (target, prop) { // {{{1
  //console.log('known prop', prop, 'sdk', sdk)

  switch (prop) {
    case 'loadAccount': {
      target[prop] = known_loadAccount

      return target[prop];
    }
  }
}

function known_loadAccount (opts = this.opts4loadAccount) { // {{{1
  console.log('known_loadAccount opts.accountId.value', opts.accountId.inject_accountId(opts), 'opts', opts)

  return opts.accountId.value;
/*
  return opts.accountId ? this.server.loadAccount(opts.accountId)
    : opts.creator ? // but first, run this tX: use opts.creator.{destination,startingBalance,source) and createAccount opts.accountId
    : // but first, create the creator account (TESTNET only)

  In other words, opts.accountId ==> opts.creator.{destination,startingBalance,source) ==> opts.creator 
*/
}

function known_opts4loadAccount (target, prop) { // {{{1
  switch (prop) {
    case 'creator': {
      return target[prop] = new Proxy(
        {
          destination: new Proxy({ inject_destination }, server.opts4loadAccount.creator.destination),
          source: new Proxy({ inject_source }, server.opts4loadAccount.creator.source),
          startingBalance: new Proxy({ inject_startingBalance }, server.opts4loadAccount.creator.startingBalance),
        },
        server.opts4loadAccount.creator
      );
    }
    case 'accountId': {
      return target[prop] = new Proxy({ inject_accountId }, server.opts4loadAccount.accountId);
    }
  }
}

function known_opts4loadAccount_accountId (target, prop) { // {{{1
  console.log('known_opts4loadAccount_accountId target', target, 'prop', prop)

}

export default server // {{{1

