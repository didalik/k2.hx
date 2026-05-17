import { hXsdk, } from './sdk.mjs' // {{{1
import { makeRequest, } from './api.js'
import { Context, destFund, issuerClaimant, } from './util.js'
import { Asset, Keypair, } from '@stellar/stellar-sdk'

let sdk, vault, accounts = {}, stateInitial = { // {{{1
  handle: handle_stateInitial,
}, stateInitial4user = { // {{{1
  handle: null //handle_stateInitial4user,
}

function Demo (opts) { // see also https://www.youtube.com/watch?v=y4TELgx28D4 {{{1
  vault ??= opts.vault
  sdk ??= hXsdk({ vault })

  opts.context = new Context(stateInitial)
  sdk.addStream(opts, "Issuer's claimant effects for user",
    [['claimable_balance_claimant_created', issuerClaimant]], opts.issuerKeys[1]
  )
  return destFund(sdk, opts). // Get HEXA 1100 to run the demo (as Ann).
  then(_ => rs4d(opts)). // Request red snapper for dinner.
  then(_ => stop('OK', opts));
}

function DemoTmUse (opts) { // {{{1
  if (!opts.vault) throw Error('opts.vault missing')
  vault = opts.vault
  let name = opts.name
  return (sdk = hXsdk({ vault })).server.loadAccount(opts).then(account => {
    accounts[name] = account
    accounts[name + 'Keys'] = vault.get(name + '.keys')
    return setupAccount(opts);
  }).then(_ => {
    Object.assign(opts, { streams: [], }, Promise.withResolvers())
    let account = accounts[name]
    let trade = effect => { // {{{2
      //console.log('DemoTmUse.trade effect', effect)

      setTimeout(_ => opts.resolve('XOXOXO'), 16000)
    } // }}}2
    sdk.addStream(opts, `${name}'s trading effects`, [['trade', trade]], account.id, true)
    return sdk.transaction.makeBuyOffer.call(sdk,
      Keypair.fromSecret(accounts[name + 'Keys'][0]), 
      account, opts.asset.XLM, opts.asset.MA, '1', '1'
    );
  }).then(r => {
    console.log(`sdk.transaction.makeBuyOffer r ${r}`)

    return opts.promise;
  }).then(r => stop(r, opts));
}

function handle_stateInitial (e) { // {{{1
  this.log('handle_stateInitial e', e)

}

function rs4d (opts) { // Request red snapper for dinner. {{{1
  opts.sdk ??= sdk

  opts.description = 'Fresh red snapper for 4 persons GGS. HEXA 1000'
  opts.validity = '0'
  return makeRequest(opts);
}

function setupAccount (opts) { // {{{1
  let name = opts.name
  opts.recipient =  accounts[name]
  opts.recipientKeys = accounts[name + 'Keys']
  return sdk.transaction.changeTrust(opts);
}

function stop (r, opts) { // {{{1
  for (let stream of opts.streams) {
    stream.close()
    console.log(`stop - "${stream.tag}" closed.`)
  }
  return Promise.resolve(r);
}

export default { Demo, DemoTmUse, } // {{{1

