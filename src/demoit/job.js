import { hXsdk, } from '../../lib/sdk.mjs' // {{{1
import { effectDesc, makeOffer, parseHEXA, takeOffer, takeRequest, } from '../../lib/api.js'
import { stopMonitor, } from '../../lib/util.js'
import { Asset, Keypair, } from '@stellar/stellar-sdk'

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
  return opts.promise.then(r => stopMonitor(r, opts));
}

export { // {{{1
  Demo, DemoSign, DemoTmReset, DemoTmUse,
}

