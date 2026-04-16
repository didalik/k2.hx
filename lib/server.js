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
    get(...args) { // {{{3
      return args[1] in args[0] ? Reflect.get(...args) : known_opts4loadAccount(...args);
    },
    accountId: { // {{{3
      get(...args) {
        return args[1] in args[0] ? Reflect.get(...args) : known_opts4loadAccount_accountId(...args);
      },
    },
    creator: { // {{{3
      get(...args) {
        return args[1] in args[0] ? Reflect.get(...args) : known_opts4loadAccount_creator(...args);
      },
      destination: {
        get(...args) {
          return args[1] in args[0] ? Reflect.get(...args) : known_opts4loadAccount_creator_destination(...args);
        },
      },
      source: {
        get(...args) {
          return args[1] in args[0] ? Reflect.get(...args) : known_opts4loadAccount_creator_source(...args);
        },
      },
      startingBalance: {
        get(...args) {
          return args[1] in args[0] ? Reflect.get(...args) : known_opts4loadAccount_creator_startingBalance(...args);
        },
      },
    }, // }}}3
  }, // }}}2
}

function create_account (opts) { // {{{1
  if (this.value) { // account exists
    return this.value;
  }
  console.log('create_account this', this, 'opts', opts)

  // Create account
  return /*this.value = */opts.optXA;
}

function inject_accountId (opts) { // {{{1
  if (this.value) { // account exists
    return this.value;
  }

  // Create account
  console.log('inject_accountId this', this, 'opts', opts)

  return this.value = opts.creator.create_account({ optXA: 'XA' });
}

function inject_destination (opts) { // {{{1
  console.log('inject_destination this', this, 'opts', opts)

}

function inject_source (opts) { // {{{1
  console.log('inject_source this', this, 'opts', opts)

}

function inject_startingBalance (opts) { // {{{1
  console.log('inject_startingBalance this', this, 'opts', opts)

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
          create_account,
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

function known_opts4loadAccount_creator (target, prop) { // {{{1
  console.log('known_opts4loadAccount_creator target', target, 'prop', prop)

}

function known_opts4loadAccount_creator_destination (target, prop) { // {{{1
  console.log('known_opts4loadAccount_creator_destination target', target, 'prop', prop)

}

function known_opts4loadAccount_creator_source (target, prop) { // {{{1
  console.log('known_opts4loadAccount_creator_source target', target, 'prop', prop)

}

function known_opts4loadAccount_creator_startingBalance (target, prop) { // {{{1
  console.log('known_opts4loadAccount_creator_startingBalance target', target, 'prop', prop)

}

export default server // {{{1

