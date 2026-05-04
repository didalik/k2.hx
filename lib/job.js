import { hXsdk, } from './sdk.mjs' // {{{1
import { Asset, Keypair, } from '@stellar/stellar-sdk'

let sdk, vault, accounts = {}; // {{{1

function Demo () { // {{{1
  return Promise.resolve('OK');
}

function DemoSign () { // {{{1
  return Promise.resolve('OK');
}

/** function DemoTmReset (opts) { // {{{1
 * Resets Stellar TESTNET monitor:
 * - sets up accounts for Issuer, Bob, and Cyn.
 *
 * See also {@link https://www.youtube.com/watch?v=y4TELgx28D4|this YouTube video}.
 *
 * @param {object} opts:
 * - vault.
 *
 * @returns {Promise<string>} promise that resolves to a string.
 */
function DemoTmReset (opts = {}) {
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
      if (vault.get('accounts.setup') === 'DONE') {
        return Promise.resolve('OK');
      }
      return setupAccounts();
    });
}

function DemoTmUse (opts) { // {{{1
  startMonitor(Object.assign(opts, { cyn: { account: accounts.cyn, }, }))
  return opts.promise.then(r => stopMonitor(r, opts));
}

function DemoTmUseRequest (opts) { // {{{1
  let name = opts.name
  return addAccount(name).then(account => {
    accounts[name] = account
    accounts[name + 'Keys'] = vault.get(name + '.keys')
    return setupAccount(opts);
  })
}

function addAccount (name) { // {{{1
  delete sdk.server.opts4loadAccount.account
  sdk.server.opts4loadAccount.name = name
  if (sdk.transaction?.opts4createAccount?.defaults?.opts) {
    sdk.transaction.opts4createAccount.defaults.opts = {}
  }
  return sdk.server.loadAccount(sdk.server.opts4loadAccount);
}

function runMonitor (opts) { // {{{1
  let timeoutID, account = accounts.bob
  let trade = effect => { // {{{2
    console.log('runMonitor.trade effect', effect)

    if (!opts?.cyn?.account) {
      throw Error('Cyn account NOT LOADED')
    }
    // if demo granted (Agent sold 1 MA for 1 XLM) steps
    if (+effect.bought_amount == 1) {
      // 1. Make buy offer for Agent: buy 2 MA for 4 XLM.
      makeBuyOffer.call(this, d.kp, account, d.MA, d.XLM, '2', '2')
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
    Keypair.fromSecret(accounts.bobKeys[0]), 
    account, opts.asset.MA, opts.asset.XLM, '1', '1'
  ).then(r => console.log('sdk.transaction.makeSellOffer r', r))
}

function setupAccount (opts) { // {{{1
  let name = opts.name
  opts.recipient =  accounts[name]
  opts.recipientKeys = accounts[name + 'Keys']
  return sdk.transaction.changeTrust(opts);
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
      agentKeys: accounts.bobKeys,
      asset: 'MA',
      amount: '1000',
      clawback: false,
    })
    return sdk.transaction.fund(opts);
  }).then(_ => {
    opts.agentKeys = accounts.cynKeys
    return sdk.transaction.fund(opts);
  }).then(_ => (vault.put('accounts.setup', 'DONE'), Promise.resolve(accounts)));
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
      onmessage: e => console.log('startMonitor e', e),
    }), 
    tag: 'orderbook',
  })  
  // }}}2
  opts.asset = asset
  //console.log('startMonitor opts', opts)

  runMonitor(opts)
}

function stopMonitor (r, opts) { // {{{1
  for (let stream of opts.streams) {
    stream.close()
    console.log(`stopMonitor - "${stream.tag}" closed.`)
  }
  return Promise.resolve(r);
}

export { Demo, DemoSign, DemoTmReset, DemoTmUse, DemoTmUseRequest, } // {{{1

