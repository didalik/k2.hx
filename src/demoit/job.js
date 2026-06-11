import { hXsdk, } from '../../lib/sdk.mjs' // {{{1
import { effectDesc, makeOffer, parseHEXA, takeOffer, takeRequest, } from '../../lib/api.js'
import { stopMonitor, } from '../../lib/util.js'
import { /*Asset,*/ Keypair, } from '@stellar/stellar-sdk'

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
  let accounts = {}, sdk, vault = opts.vault
  return (sdk = opts.sdk = hXsdk({ vault })).server.loadAccount({ name: 'Issuer' }).
    then(account => {
      accounts.issuer = account
      accounts.issuerKeys = vault.get('Issuer.keys')
      return addAccount('Bob', sdk);
    }).
    then(account => {
      accounts.bob = account
      accounts.bobKeys = vault.get('Bob.keys')
      return addAccount('Cyn', sdk);
    }).
    then(account => {
      accounts.cyn = account
      accounts.cynKeys = vault.get('Cyn.keys')
      if (vault.get('accounts.set') === 'DONE') {
        return Promise.resolve('OK');
      }
      return setupAccounts(accounts, sdk, vault);
    }); // }}}2
}

function DemoTmUse (opts) { // {{{1
  //startMonitor(Object.assign(opts, { cyn: { account: accounts.cyn, }, }))
  return opts.prr.promise.then(r => stopMonitor(r, opts));
}

function addAccount (name, sdk) { // {{{1
  sdk.server.opts4loadAccount?.account && delete sdk.server.opts4loadAccount.account
  sdk.server.opts4loadAccount ??= {}
  sdk.server.opts4loadAccount.name = name
  sdk.transaction.opts4createAccount ??= { defaults: {} }
  sdk.transaction.opts4createAccount.defaults.opts = {}
  return sdk.server.loadAccount(sdk.server.opts4loadAccount);
}

function setupAccounts (accounts, sdk, vault) { // {{{1
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

export { // {{{1
  Demo, DemoSign, DemoTmReset, DemoTmUse,
}

