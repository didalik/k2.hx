import { // {{{1
  Asset,
  AuthClawbackEnabledFlag, AuthRevocableFlag, BASE_FEE,
  Keypair,
  //Horizon, MemoHash, MemoText,
  Operation, TransactionBuilder,
} from '@stellar/stellar-sdk'

let sdk; const transaction = { // handlers {{{1
  get(...args) { // {{{2
    switch (args[1]) {
      case 'changeTrust':
      case 'createAccount':
      case 'fund':
      case 'makeBuyOffer':
      case 'makeSellOffer': {
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
  opts4changeTrust: { // {{{2
    get(...args) { // {{{3
      return args[1] in args[0] ? Reflect.get(...args) : known_opts4changeTrust(...args);
    }, // }}}3
  },
  opts4createAccount: { // {{{2
    get(...args) { // {{{3
      return args[1] in args[0] ? Reflect.get(...args) : known_opts4createAccount(...args);
    }, // }}}3
  },
  opts4fund: { // {{{2
    get(...args) { // {{{3
      return args[1] in args[0] ? Reflect.get(...args) : known_opts4fund(...args);
    }, // }}}3
  },
  // }}}2
}

function changeTrust (opts) { // {{{1
  sdk ??= this.sdk // this === sdk.transaction
  this.opts4changeTrust ??= new Proxy(opts, transaction.opts4changeTrust)
  let defaults = this.opts4changeTrust.defaults
  //console.log('changeTrust opts', opts)

  let tx = new TransactionBuilder(opts.recipient, { fee: BASE_FEE }).
    setNetworkPassphrase(sdk.networkPassphrase)
  for (let a of defaults.assets) {
    tx.addOperation(Operation.changeTrust({
      asset: new Asset(a[0], opts.issuer.id),
      limit: a[1]
    }))
  }
  tx = tx.setTimeout(30).build()
  tx.sign(Keypair.fromSecret(opts.recipientKeys[0]))
  console.log('changeTrust - recipient', opts.recipient.id, '...')

  return sdk.server.server.submitTransaction(tx).
    catch(e => console.error('*** ERROR ***', e.response.data.extras.result_codes));
}

function createAccount (opts) { // {{{1
  sdk ??= this.sdk // this === sdk.transaction
  this.opts4createAccount ??= new Proxy(opts, transaction.opts4createAccount)
  let defaults = this.opts4createAccount.defaults
  let destination = opts.account.keypair.publicKey()
  let startingBalance = opts.account.startingBalance
  let key = opts.account.name + '.keys'
  let value = [opts.account.keypair.secret(), destination]
  let tx = new TransactionBuilder(opts.creator.account, { fee: BASE_FEE }).
    addOperation(Operation.createAccount({ destination, startingBalance })).
    addOperation(Operation.setOptions(defaults.opts)).
    setNetworkPassphrase(sdk.networkPassphrase).
    setTimeout(30).build();
  tx.sign(opts.creator.keypair) //, opts.account.keypair)
  console.log(`createAccount - creating account ${destination}...`)

  return sdk.server.server.submitTransaction(tx).
    then(r => (sdk.vault.put(key, value), opts.account.resolve(destination))).
    catch(e => console.error('*** ERROR ***', e.response.data.extras.result_codes));
}

function fund (opts) { // {{{1
  sdk ??= this.sdk // this === sdk.transaction
  let asset = new Asset(opts.asset, opts.issuerKeys[1])
  let destination = opts.agentKeys[1]
  let amount = opts.amount
  let source = opts.issuerKeys[1]
  let tx = new TransactionBuilder(opts.issuer, { fee: BASE_FEE }).
    setNetworkPassphrase(sdk.networkPassphrase).
    addOperation(Operation.payment({ asset, destination, amount, source }))
  if (opts.clawback === false) {
    tx.addOperation(Operation.setTrustLineFlags({ 
      asset, source,
      trustor: destination,
      flags: {
        clawbackEnabled: false
      },
    }))
  }
  tx = tx.setTimeout(30).build()
  tx.sign(Keypair.fromSecret(opts.issuerKeys[0]))
  console.log('fund - recipient', opts.agentKeys[1], 'clawback', opts.clawback, '...')

  return sdk.server.server.submitTransaction(tx).
    catch(e => console.error('*** ERROR ***', e.response.data.extras.result_codes));
}

function inject_default_opts4changeTrust (opts) { // for a clawable asset issuer {{{1
  //console.log('inject_default_opts4changeTrust this', this, 'opts', opts)

  const limit = '1000000' // trust up to limit
  return {
    assets: [['ClawableHexa', limit], ['HEXA', limit], ['MA', limit]],
  };
}

function inject_default_opts4createAccount (opts) { // for a clawable asset issuer {{{1
  //console.log('inject_default_opts4createAccount this', this, 'opts', opts)

  return {
    opts: { // for Operation.setOptions
      homeDomain: 'hx.kloudoftrust.org',
      setFlags: AuthClawbackEnabledFlag | AuthRevocableFlag,
      //source: opts.creator.keypair.publicKey(),
    },
  };
}

function known (target, prop) { // {{{1
  let unknown = _ => { throw Error(`unknown prop ${prop}`) }

  target[prop] = 
    prop == 'changeTrust' ? changeTrust :
    prop == 'createAccount' ? createAccount :
    prop == 'fund' ? fund :
    prop == 'makeBuyOffer' ? makeBuyOffer :
    prop == 'makeSellOffer' ? makeSellOffer
    : unknown
  //console.log('known prop', prop, 'target', target)

  return target[prop];
}

function known_opts4changeTrust (target, prop) { // {{{1
  //console.log('known_opts4changeTrust target', target, 'prop', prop)
  //console.log('known_opts4changeTrust prop', prop)

  return target[prop] = inject_default_opts4changeTrust(target);
}
function known_opts4createAccount (target, prop) { // {{{1
  //console.log('known_opts4createAccount target', target, 'prop', prop)
  //console.log('known_opts4createAccount prop', prop)

  return target[prop] = inject_default_opts4createAccount(target);
}

function makeBuyOffer ( // {{{1
  kp, account, selling, buying, buyAmount, price, offerId = 0
) {
  sdk ??= this
  let tx = new TransactionBuilder(account, // increasing account's
    {                                      //  sequence number
      fee: BASE_FEE, networkPassphrase: sdk.networkPassphrase,
    }
  ).addOperation(Operation.manageBuyOffer({
    selling, buying, buyAmount, price, offerId
  })).setTimeout(30).build()

  let result = tx => {
    return Promise.resolve('tx.successful', tx.successful);
  }
  tx.sign(kp)
  return sdk.server.server.submitTransaction(tx).
    then(tx => result(tx)).
    catch(e => console.error('*** ERROR ***', e.response?.data?.extras?.result_codes));
}

function makeSellOffer ( // {{{1
  kp, account, selling, buying, amount, price, offerId = 0
) {
  sdk ??= this
  let tx = new TransactionBuilder(account, // increasing account's
    {                                      //  sequence number
      fee: BASE_FEE, networkPassphrase: sdk.networkPassphrase,
    }
  ).addOperation(Operation.manageSellOffer({
    selling, buying, amount, price, offerId
  })).setTimeout(30).build()

  let result = tx => {
    //console.log('makeSellOffer tx', tx)

    return Promise.resolve('tx.successful', tx.successful);
    //let made = offerMade(tx.result_xdr, 'manageSellOfferResult')
    //return Promise.resolve([tx.id, made.offer.id]);
  }
  /*if (!kp) {
    return c.sign(tx, tx => result(tx));
  }*/
  tx.sign(kp)
  return sdk.server.server.submitTransaction(tx).
    then(tx => result(tx)).
    catch(e => console.error(
    '*** ERROR ***', e.response?.data?.extras?.result_codes
    ));
}

/*function offerMade (result_xdr, kind = 'manageBuyOfferResult') { // {{{1
  let result = 
    xdr.TransactionResult.fromXDR(result_xdr, "base64").result().results()

  let index = result.length == 3 ? 1
  : result.length == 1 ? 0
  : undefined
  result = result[index] // 0:begin, 1:manage...Offer, 2:end
    .value()[kind]().value()
  let offersClaimed = result._attributes.offersClaimed
  let offer = result.offer().value()
  let id = offer?.offerId().low
  let price_r = offer?.price()._attributes

  result = { offer: { id, price_r, }, offersClaimedLength: offersClaimed.length, }
  console.log('offerMade result', result)

  return result;
}
*/
export default transaction // {{{1

