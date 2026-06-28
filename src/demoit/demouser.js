import { hXsdk, } from '../../lib/sdk.mjs' // {{{1
import { stopMonitor, } from '../../lib/util.js'
import { Keypair, } from '@stellar/stellar-sdk'

let sdk, vault // {{{1

function DemoTmUse (opts) { // {{{1
  if (!opts.vault) throw Error('opts.vault missing')
  vault = opts.vault
  return (sdk = hXsdk({ vault })).server.loadAccount(opts).then(account => {
    opts.recipient = account
    opts.recipientKeys = vault.get(opts.name + '.keys')
    return sdk.transaction.changeTrust(opts);
  }).then(_ => {
    Object.assign(opts, { streams: [], }, Promise.withResolvers())
    let account = opts.recipient
    let buy = _ => { // {{{2
      sdk.transaction.makeBuyOffer.call(sdk,
        Keypair.fromSecret(opts.recipientKeys[0]),
        account, opts.asset.XLM, opts.asset.MA, '1', '1'
      ).then(r => console.log(`demouser.DemoTmUse sdk.transaction.makeBuyOffer r ${r}`))
    }
    let trade = effect => { // {{{2
      //console.log('demouser.DemoTmUse.trade effect', effect)

      opts.prr.resolve('OK') // demo granted
    } // }}}2
    sdk.addStream(opts, `${opts.name}'s trading effects`, [['trade', trade]], account.id, true)
    setTimeout(buy, opts.timeout2trade) // to activate the trade function above
    return opts.prr.promise;
  }).then(r => stopMonitor(r, opts));
}

export default { DemoTmUse, } // {{{1

