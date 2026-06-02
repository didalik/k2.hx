import test from 'ava'; // {{{1
import fs from 'fs'
import { hXsdk } from '../../lib/sdk.mjs';
import vault from '../../lib/vault.js'
import { issuerClaimant, stopMonitor, } from '../../lib/util.js'

let opts = { name: 'Issuer', streams: [] }, prr = Promise.withResolvers(), sdk // {{{1

test.serial('load new/existing Issuer account', t => { // {{{1
  t.timeout(280000)
  return (sdk = hXsdk({ vault })).server.loadAccount(opts).then(account => {
    sdk.addStream(opts, 
      "Issuer's claimant effects",
      [['claimable_balance_claimant_created', issuerClaimant], ['claimable_balance_claimed', issuerClaimant]], 
      account.id,
      true // now
    )
    return prr.promise;
  }).then(_ => {
    t.true(vault.get('Issuer.keys').length == 2)
  })
})

let watcher = vault.watch('Issuer.in', (eventType, filename) => { // {{{1
  if (filename) {
    let v = vault.get('Issuer.in')
    //console.log(`${filename} file changed! Event type: ${eventType}`, v)
    if (v) {
      watcher.close(); stopMonitor(null, opts); prr.resolve()
    }
  }
});
