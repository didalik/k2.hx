import { hXsdk, } from '../../lib/sdk.mjs' // {{{1
import { effectDesc, makeOffer, parseHEXA, takeOffer, takeRequest, } from '../../lib/api.js'
import { stopMonitor, } from '../../lib/util.js'
import { Asset, Keypair, } from '@stellar/stellar-sdk'

let accounts = {}, sdk, vault // {{{1

function Demo (opts) { // see also https://www.youtube.com/watch?v=y4TELgx28D4 {{{1
  vault ??= opts.vault
  sdk ??= hXsdk({ vault })

  context = opts.context = new Context(stateInitial)
  sdk.addStream(opts, "Issuer's claimant effects",
    [['claimable_balance_claimant_created', issuerClaimant]], opts.issuerKeys[1]
  )
  return destFund(sdk, opts). // Get HEXA 900 for Cyn to run the demo.
  then(_ => {                 // Get HEXA 100 for Bob to run the demo. {{{2
    opts.amount = '100'
    opts.cyn = opts.account
    opts.destKeys = opts.bobKeys
    return destFund(sdk, opts);
  }).
  then(_ => {
    opts.bob = opts.account
    return Promise.resolve();
  }). // }}}2
  then(_ => fcrs(opts)).      // Bob: offer freshly caught red snapper.
  then(_ => taking2(opts)).   // Cyn: taking offer and request.
  then(takingOffer => deal.call(opts, takingOffer)). // offer is being taken
  then(_ => stopMonitor('OK', opts));
}

function DemoSign (opts) { // {{{1
  vault ??= opts.vault
  sdk ??= hXsdk({ vault })
  //console.log('DemoSign sdk', sdk)

  let kp = Keypair.fromSecret(opts.secret)
  let { xdr, tag } = opts
  return sdk.sign(kp, xdr, tag);
}

/** function DemoTmReset (opts) { // {{{1
 * Resets Stellar TESTNET monitor: {{{2
 * - sets up Stellar accounts for Issuer, Bob, and Cyn. - But not for Ann!
 *
 * See also {@link https://www.youtube.com/watch?v=y4TELgx28D4|this YouTube video}.
 *
 * @param {object} opts:
 * - vault.
 *
 * @returns {Promise<string>} promise that resolves to a string.
 */
function DemoTmReset (opts = {}) { // {{{2
  if (!opts.vault) throw Error('opts.vault missing')
  vault = opts.vault
  return (sdk = hXsdk({ vault })).server.loadAccount({ name: 'Issuer' }).
    then(account => {
      accounts.issuer = account
      accounts.issuerKeys = vault.get('Issuer.keys')
      return addAccount('Bob');
    }).
    then(account => {
      accounts.bob = account
      accounts.bobKeys = vault.get('Bob.keys')
      return addAccount('Cyn');
    }).
    then(account => {
      accounts.cyn = account
      accounts.cynKeys = vault.get('Cyn.keys')
      if (vault.get('accounts.set') === 'DONE') {
        return Promise.resolve('OK');
      }
      return setupAccounts();
    }); // }}}2
}

function DemoTmUse (opts) { // {{{1
  startMonitor(Object.assign(opts, { cyn: { account: accounts.cyn, }, }))
  return opts.prr.promise.then(r => stopMonitor(r, opts));
}

function addAccount (name) { // {{{1
  sdk.server.opts4loadAccount?.account && delete sdk.server.opts4loadAccount.account
  sdk.server.opts4loadAccount ??= {}
  sdk.server.opts4loadAccount.name = name
  sdk.transaction.opts4createAccount ??= { defaults: {} }
  sdk.transaction.opts4createAccount.defaults.opts = {}
  return sdk.server.loadAccount(sdk.server.opts4loadAccount);
}

function runMonitor (opts) { // {{{1
  let timeoutID, account = accounts.bob, kp = Keypair.fromSecret(accounts.bobKeys[0])
  accounts.asset = opts.asset

  let trade = effect => { // {{{2
    //console.log('runMonitor.trade effect', effect, 'opts', opts)

    if (!opts?.cyn?.account) {
      throw Error('Cyn account NOT LOADED')
    }
    // if demo granted (Agent sold 1 MA for 1 XLM) steps
    if (+effect.bought_amount == 1) {
      vault.put('demo.granted', 'DONE')

      // 1. Make buy offer for Agent: buy 2 MA for 4 XLM.
      return sdk.transaction.makeBuyOffer.call(sdk,
        kp,
        account, opts.asset.XLM, opts.asset.MA, '2', '2'
      ).then(r => console.log(`sdk.transaction.makeBuyOffer r ${r}`));

      // 2. Setup demox promise and TM Agent timeout.
      Object.assign(d.demox, promiseWithResolvers())
      timeoutID = setTimeout(_ => d.demox.resolve(), 120000) // 2 min timeout
      // 3. Start the demo.
      runDemo.call(this)
      // 4. Wait for either:
      // - demo completion;
      // - timeout expiration, and then:
      d.demox.promise.then(result => {
        e.log('run result', result)

        result?.demo && clearTimeout(timeoutID)
        // 5. Make sell offer for DemoX: sell 2 MA for 4 XLM.
        makeSellOffer.call(this, d.demox.kp, d.demox.account, d.MA, d.XLM, '2', '2')
      })
    // else (Agent bought 2 MA for 4 XLM) steps
    } else { // assert +e.bought_amount == 2
      // 1. Make sell offer for Agent: sell 1 MA for 1 XLM.
      makeSellOffer.call(this, d.kp, account, d.MA, d.XLM, '1', '1')
    }
  } // }}}2
  sdk.addStream(opts, "Bob's trading effects", [['trade', trade]],account.id, true)
  sdk.transaction.makeSellOffer.call(sdk,
    kp,
    account, opts.asset.MA, opts.asset.XLM, '1', '1'
  ).then(r => console.log('\n\rrunMonitor sdk.transaction.makeSellOffer r', r))
}

function setupAccounts () { // {{{1
  const opts = {
    issuer: accounts.issuer, 
    recipient: accounts.bob,
    recipientKeys: accounts.bobKeys,
  }
  return sdk.transaction.changeTrust(opts).then(_ => {
    opts.recipient = accounts.cyn
    opts.recipientKeys = accounts.cynKeys
    return sdk.transaction.changeTrust(opts);
  }).then(_ => {
    Object.assign(opts, {
      issuerKeys: accounts.issuerKeys,
      destKeys: accounts.bobKeys,
      asset: 'MA',
      amount: '1000',
      clawback: false,
    })
    return sdk.transaction.fund(opts);
  }).then(_ => {
    opts.destKeys = accounts.cynKeys
    return sdk.transaction.fund(opts);
  }).then(_ => (vault.put('accounts.set', 'DONE'), Promise.resolve(accounts)));
}

function startMonitor (opts) { // {{{1
  let asset = {
    MA: new Asset('MA', accounts.issuerKeys[1]),
    XLM: new Asset('XLM', null),
  }
  let ob = sdk.server.server.orderbook(asset.MA, asset.XLM).cursor('now') // {{{2
  opts.streams = []
  opts.streams.push({
    close: ob.stream({
      onerror:   e => { throw e; },
      //onmessage: e => console.log('orderbook', e),//{ asks: e.asks, bids: e.bids, }),
    }), 
    tag: 'orderbook',
  })  
  // }}}2
  opts.asset = asset
  //console.log('startMonitor opts', opts)

  runMonitor(opts)
  vault.put('tm.up', 'DONE')
}

export { // {{{1
  Demo, DemoSign, DemoTmReset, DemoTmUse,
}

