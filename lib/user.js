import { hXsdk, } from './sdk.mjs' // {{{1
import { HEX_KEY, effectDesc, makeRequest, } from './api.js'
import { Context, destFund, stopMonitor, } from './util.js'
import { Asset, Keypair, } from '@stellar/stellar-sdk'

let context, sdk, vault, accounts = {}, stateInitial = { // {{{1
  handle: handle_stateInitial,
}, stateCynAnnDeal = { // {{{1
  handle: handle_stateCynAnnDeal,
}

function Demo (opts) { // see also https://www.youtube.com/watch?v=y4TELgx28D4 {{{1
  vault ??= opts.vault
  sdk ??= hXsdk({ vault })

  context = opts.context = new Context(stateInitial, 'user')
  sdk.addStream(opts, "Issuer's claimant effects for user",
    [['claimable_balance_claimant_created', issuerClaimant]], opts.issuerKeys[1]
  )
  return destFund(sdk, opts). // Get HEXA 1100 to run the demo (as Ann).
  then(_ => rs4d(opts)).      // Request red snapper for dinner.
  then(takingRequest => deal.call(opts, takingRequest)). // request is being taken
  then(_ => stopMonitor('OK', opts));
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
  }).then(r => stopMonitor(r, opts));
}

function deal (takingRequest) { // {{{1
  this.log('deal takingRequest', takingRequest)

  return Promise.resolve();
}

function handle_stateCynAnnDeal (e) { // {{{1
  return Promise.resolve(e);
}

function handle_stateInitial (e) { // {{{1
  return effectDesc(e).then(desc => {
    this.log('handle_stateInitial e', desc)

    if (desc.amount == HEX_KEY && desc.txDesc == '') {
      this.context.state = stateCynAnnDeal
      return stateInitial.resolve(desc);
    }
    return Promise.resolve();
  });
}

function issuerClaimant (effect) { // {{{1
  if (context != this.context) {
    this.log('issuerClaimant IGNORE')
    
    return;
  }
  this.context.state.handle.call(this, effect)
}

function rs4d (opts) { // Request red snapper for dinner. {{{1
  opts.sdk ??= sdk

  opts.description = 'Fresh red snapper for 4 persons GGS. HEXA 1000'
  opts.validity = '0'
  Object.assign(stateInitial, Promise.withResolvers())
  return makeRequest(opts).then(_ => stateInitial.promise).
  then(takingRequest => opts.context.state.handle.call(opts, takingRequest));
}

function setupAccount (opts) { // {{{1
  let name = opts.name
  opts.recipient =  accounts[name]
  opts.recipientKeys = accounts[name + 'Keys']
  return sdk.transaction.changeTrust(opts);
}

export default { Demo, DemoTmUse, } // {{{1

