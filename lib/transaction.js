import { // {{{1
  Asset,
  AuthClawbackEnabledFlag, AuthRequiredFlag, AuthRevocableFlag, BASE_FEE,
  Keypair, Memo,
  Operation, TransactionBuilder, xdr
} from '@stellar/stellar-sdk'

let sdk; const transaction = { // handlers {{{1
  get(...args) { // {{{2
    switch (args[1]) {
      case 'breakDeal':
      case 'changeTrust':
      case 'closeDeal':
      case 'createAccount':
      case 'dealTakeOffer':
      case 'dealTakeRequest':
      case 'fund':
      case 'makeBuyOffer':
      case 'makeClaimableBalance':
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

function breakDeal (opts) { // {{{1
  if (opts.signXDR) { // {{{2
    return true; //false; // FIXME
  }
  let HEXA = new Asset('HEXA', opts.issuer.id), amount = opts.amount // {{{2
  let asset = new Asset('ClawableHexa', opts.issuer.id)
  let breaker = opts.account
  let destination = opts.account.id
  let kp = Keypair.fromSecret(opts.destKeys[0])
  let memo = Memo.hash(opts.dealTxId)
  let networkPassphrase = opts.sdk.networkPassphrase
  let server = opts.sdk.server.server
  let source = opts.issuer.id
  let tx = new TransactionBuilder(breaker, // increasing the breaker's
    {                                      //  sequence number
      fee: BASE_FEE, memo, networkPassphrase
    }
  )
  let ops = [ // {{{2
    Operation.beginSponsoringFutureReserves({ sponsoredId: source }),
    Operation.clawback({ asset, amount, from: opts.from, source }),
    Operation.payment({ amount, asset: HEXA, destination, source }),
    Operation.endSponsoringFutureReserves({ source }),
  ]
  for (let op of ops) {
    tx = tx.addOperation(op)
  }
  tx = tx.setTimeout(30).build()
  tx.sign(kp)

  return opts.sign(tx.toXDR(), 'breakDeal').then(txXdr => // {{{2
    server.submitTransaction(TransactionBuilder.fromXDR(txXdr, networkPassphrase))
  ).catch(e => {
    console.error('breakDeal.local ERROR', e?.response?.data ?? e); throw e
  });
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
    catch(e => console.error('changeTrust ERROR', e.response.data.extras.result_codes));
}

function closeDeal (opts) { // {{{1
  if (opts.signXDR) { // {{{2
    return true; //false; // FIXME
  }
  let HEXA = new Asset('HEXA', opts.issuer.id), amount = opts.amount // {{{2
  let asset = new Asset('ClawableHexa', opts.issuer.id)
  let destination = opts.account.id
  let kp = Keypair.fromSecret(opts.destKeys[0])
  let memo = Memo.hash(opts.dealTxId)
  let networkPassphrase = opts.sdk.networkPassphrase
  let payee = opts.account
  let server = opts.sdk.server.server
  let source = opts.issuer.id
  let tx = new TransactionBuilder(payee, // increasing the payee's
    {                                    //  sequence number
      fee: BASE_FEE, memo, networkPassphrase
    }
  )
  let ops = [ // {{{2
    Operation.payment({ amount, asset, destination: source }),
    Operation.beginSponsoringFutureReserves({ sponsoredId: source }),
    Operation.payment({ amount, asset: HEXA, destination, source }),
    Operation.endSponsoringFutureReserves({ source }),
  ]
  for (let op of ops) {
    tx = tx.addOperation(op)
  }
  tx = tx.setTimeout(30).build()
  tx.sign(kp)

  return opts.sign(tx.toXDR(), 'closeDeal').then(txXdr => // {{{2
    server.submitTransaction(TransactionBuilder.fromXDR(txXdr, networkPassphrase))
  ).catch(e => {
    console.error('closeDeal.local ERROR', e?.response?.data ?? e); throw e
  });
  // }}}2
}

function createAccount (opts) { // {{{1
  sdk ??= this.sdk // this === sdk.transaction
  this.opts4createAccount = new Proxy(opts, transaction.opts4createAccount)
  let defaults = this.opts4createAccount.defaults
  let destination = opts.account.keypair.publicKey()
  let startingBalance = opts.account.startingBalance
  let key = opts.account.name + '.keys'
  let value = [opts.account.keypair.secret(), destination]
  //console.log('createAccount defaults', defaults)//, 'destination', destination, 'startingBalance', startingBalance, 'key', key, 'value', value)

  let tx = new TransactionBuilder(opts.creator.account, { fee: BASE_FEE }).
    addOperation(Operation.createAccount({ destination, startingBalance })).
    addOperation(Operation.setOptions(defaults.opts)).
    setNetworkPassphrase(sdk.networkPassphrase).
    setTimeout(30).build();
  tx.sign(opts.creator.keypair, opts.account.keypair)
  console.log(`createAccount - creating account ${destination}...`)

  return sdk.server.server.submitTransaction(tx).
    then(r => (sdk.vault.put(key, value), opts.account.resolve(destination))).
    catch(e => {
      console.error('createAccount ERROR', e?.response?.data?.extras?.result_codes ?? e)
      return new Promise(r => setTimeout(r, 5000)).then(_ => createAccount.call(this, opts));
    });//.extras.result_codes));
}

function dealTakeOffer (opts) { // {{{1
  if (opts.signXDR) { // {{{2
    return true; //false; // FIXME
  }
/*  Offer-Take-Deal Diagram             Offer-Take-NoDeal Diagram       {{{2
  +-------+ +--------+ +------+       +-------+ +--------+ +------+
  |  Bob  | | Issuer | |  Cyn |       |  Bob  | | Issuer | |  Cyn |
  +-------+ +--------+ +------+       +-------+ +--------+ +------+
      |          |         |              |          |         |
      | offer    |         |              | offer    |         |
      |====k====>| effect  |              |====k====>| effect  |
      |    k     |-------->|              |    k     |-------->|
      |    k     |         |              |    k     |         |
      |    k     |    take |              |    k     |    take |
      |   effect |<====t===|              |    k     |<=t===== |
      |<---------|     t   |              |    k     |  t      |
      |-bsfr---->| claim t |              |    k     |  t      |
      |    pay T |====>t   |              |    k     |  t      |
      |<=========|         |              |    k     |  t      |
      |-esfr---->|         |              |    k     |  t      |
      | claim k to drop the offer         |    k     |  t      |
      |===>k     |         |              |    k     |  t claim|
      |          |         |              |    k     |  t<=====|
      |          |         |              |    k     |         |
*/
  let amount = opts.e.amount // {{{2
  let asset = new Asset('ClawableHexa', opts.issuer.id)
  let balanceId = opts.e.balance_id
  let destination = opts.account.id
  let kp = Keypair.fromSecret(opts.destKeys[0])
  let maker = opts.account
  let sdk = opts.sdk
  let sign = opts.sign
  let source = opts.issuer.id
  let takeTxId = opts.e.txId

  let memo = Memo.return(takeTxId) // {{{2
  let tx = new TransactionBuilder(maker, // increasing the maker's
    {                                    //  sequence number
      fee: BASE_FEE, memo, networkPassphrase: sdk.networkPassphrase,
    }
  )
  let ops = [ // {{{2
    Operation.beginSponsoringFutureReserves({ sponsoredId: source }),
    Operation.claimClaimableBalance({ balanceId, source }),
    Operation.payment({ amount, asset, destination, source }),
    Operation.endSponsoringFutureReserves({ source }),
    Operation.claimClaimableBalance({ balanceId: opts.makerBalanceId }),
  ]
  for (let op of ops) {
    tx = tx.addOperation(op)
  }
  tx = tx.setTimeout(30).build()
  tx.sign(kp)

  return sign(tx.toXDR(), 'dealTakeOffer').then(txXdr => // {{{2
    sdk.server.server.submitTransaction(TransactionBuilder.fromXDR(txXdr, sdk.networkPassphrase))
  ).catch(e => {
    console.error('dealTakeOffer.local ERROR', e?.response?.data ?? e); throw e
  });
  // }}}2
}

function dealTakeRequest (opts) { // {{{1
  if (opts.signXDR) { // {{{2
    return true; //false; // FIXME
  }
/*  Request-Take-Deal Diagram          Request-Take-NoDeal Diagram       {{{2
  +-------+ +--------+ +------+       +-------+ +--------+ +------+
  |  Ann  | | Issuer | |  Cyn |       |  Ann  | | Issuer | |  Cyn |
  +-------+ +--------+ +------+       +-------+ +--------+ +------+
     |           |         |              |          |         |
     |  request  |         |              | request  |         |
     |=====r====>| effect  |              |====r====>| effect  |
     |     r     |-------->|              |    r     |-------->|
     |     r     |         |              |    r     |         |
     |     r     |    take |              |    r     |    take |
     |    effect |<====k===|              |    r     |<=k===== |
     |<----------|     k   |              |    r     |  k      |
     |--bsfr---->| claim k |              |    r     |  k      |
     |claiming r |====>k   |              |    r     |  k      |
     |     r<====| pay R   |              |    r     |  k      |
     |drops      |========>|              |    r     |  k claim|
     |the request| pay k   |              |    r     |  k<=====|
     |           |========>|              |    r     |         |
     |-esfr----> |         |              |    r     |         |
*/

  let HEXA = new Asset('HEXA', opts.issuer.id), amount = opts.e.amount // HEX_KEY {{{2
  let asset = new Asset('ClawableHexa', opts.issuer.id), r_amount = opts.r_amount
  let balanceId = opts.e.balance_id, r_balanceId = opts.r_balanceId
  let destination = opts.e.txSrc // takerId
  let kp = Keypair.fromSecret(opts.destKeys[0])
  let maker = opts.account
  let sdk = opts.sdk
  let sign = opts.sign
  let source = opts.issuer.id
  let takeTxId = opts.e.txId

  let memo = Memo.return(takeTxId) // {{{2
  let tx = new TransactionBuilder(maker, // increasing the maker's
    {                                    //  sequence number
      fee: BASE_FEE, memo, networkPassphrase: sdk.networkPassphrase,
    }
  )
  let ops = [ // {{{2
    Operation.beginSponsoringFutureReserves({ sponsoredId: source }),
    Operation.claimClaimableBalance({ balanceId, source }),
    Operation.claimClaimableBalance({ balanceId: r_balanceId, source }),
    Operation.payment({ amount, asset: HEXA, destination, source }),
    Operation.payment({ amount: r_amount, asset, destination, source }),
    Operation.endSponsoringFutureReserves({ source }),
  ]
  for (let op of ops) {
    tx = tx.addOperation(op)
  }
  tx = tx.setTimeout(30).build()
  tx.sign(kp)

  return sign(tx.toXDR(), 'dealTakeRequest').then(txXdr => // {{{2
    sdk.server.server.submitTransaction(TransactionBuilder.fromXDR(txXdr, sdk.networkPassphrase))
  ).catch(e => {
    console.error('dealTakeRequest.local ERROR', e?.response?.data ?? e); throw e
  });
  // }}}2
}

function fund (opts = null) { // {{{1
  //console.log('fund opts', opts, opts.clawback === false)

  if (opts === null) { // noop
    return Promise.resolve();
  }
  sdk ??= this.sdk // this === sdk.transaction
  if (opts.signXDR) {
    return true; //false; // FIXME
  }
  let account = opts.account ? opts.account : opts.issuer
  let asset = new Asset(opts.asset, opts.issuerKeys[1])
  let destination = opts.destKeys[1]
  let amount = opts.amount
  let source = opts.issuerKeys[1]
  let kp = Keypair.fromSecret(opts.account ? opts.destKeys[0] : opts.issuerKeys[0])
  let sign = opts.sign
  let tf = { asset, source, trustor: destination, flags: { authorized: true, } }
  if (opts.clawback === false) {
    tf.flags.clawbackEnabled = false
  }
  let tx = new TransactionBuilder(account, { fee: BASE_FEE }).
    setNetworkPassphrase(sdk.networkPassphrase).
    addOperation(Operation.payment({ asset, destination, amount, source })).
    addOperation(Operation.setTrustLineFlags(tf))
  tx = tx.setTimeout(30).build()
  tx.sign(kp)
  console.log('fund - destination', opts.destKeys[1], 'clawback', opts.clawback, '...')

  if (sign) {
    return sign(tx.toXDR(), 'fund').then(txXdr =>
      sdk.server.server.submitTransaction(TransactionBuilder.fromXDR(txXdr, sdk.networkPassphrase))
    ).catch(e => {
      console.error('fund.local ERROR', e?.response?.data ?? e); throw e
    });
  }
  return sdk.server.server.submitTransaction(tx).
    catch(e => console.error('fund ERROR', e.response.data.extras.result_codes));
}

function getClaimableBalanceId (result_xdr, index = 0) { // {{{1
  let txResult = xdr.TransactionResult.fromXDR(result_xdr, "base64");
  let results = txResult.result().results();
  let operationResult = results[index].value().createClaimableBalanceResult();
  let balanceId = operationResult.balanceId().toXDR("hex");
  return balanceId;
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
      source: opts.account.keypair.publicKey(),
    },
  };
}

function known (target, prop) { // {{{1
  let unknown = _ => { throw Error(`unknown prop ${prop}`) }

  target[prop] = 
    prop == 'breakDeal' ? breakDeal :
    prop == 'changeTrust' ? changeTrust :
    prop == 'closeDeal' ? closeDeal :
    prop == 'createAccount' ? createAccount :
    prop == 'dealTakeOffer' ? dealTakeOffer :
    prop == 'dealTakeRequest' ? dealTakeRequest :
    prop == 'fund' ? fund :
    prop == 'makeBuyOffer' ? makeBuyOffer :
    prop == 'makeClaimableBalance' ? makeClaimableBalance :
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
  //console.log('makeBuyOffer kp', kp, account, selling, buying, buyAmount, price, offerId)

  let tx = new TransactionBuilder(account, // increasing account's
    {                                      //  sequence number
      fee: BASE_FEE, networkPassphrase: sdk.networkPassphrase,
    }
  ).addOperation(Operation.manageBuyOffer({
    selling, buying, buyAmount, price, offerId
  })).setTimeout(30).build()

  let result = tx => {
    return Promise.resolve(`tx.successful ${tx.successful}`);
  }
  tx.sign(kp)
  return sdk.server.server.submitTransaction(tx).
    then(tx => result(tx)).
    catch(e => console.error('makeBuyOffer ERROR', e.response?.data?.extras?.result_codes));
}

function makeClaimableBalance ( // {{{1
  claimants, maker, kp, asset, amount, ops = [], memo = null
) {
  sdk ??= this
  let tx = new TransactionBuilder(maker, // increasing the maker's
    {                                    //  sequence number
      fee: BASE_FEE, memo, networkPassphrase: sdk.networkPassphrase,
    }
  ).addOperation(Operation.createClaimableBalance({ claimants, asset, amount }))
  ops.forEach(op => tx.addOperation(op))
  tx = tx.setTimeout(30).build()
  tx.sign(kp)
  return sdk.server.server.submitTransaction(tx).then(txR => ({
    balanceId: getClaimableBalanceId(txR.result_xdr),
    txId: txR.id,
  })).catch(e => {
    console.error('makeClaimableBalance ERROR', 
      e.response?.data.extras.result_codes //,
      //e.message, e.stack
    )
    throw e;
  });
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
    return Promise.resolve(`tx.successful ${tx.successful}`);
  }
  tx.sign(kp)
  return sdk.server.server.submitTransaction(tx).
    then(tx => result(tx)).
    catch(e => console.error(
      'makeSellOffer ERROR', e.response?.data?.extras?.result_codes
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

