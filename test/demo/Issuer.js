import test from 'ava'; // {{{1
import fs from 'fs'
import { hXsdk } from '../../lib/sdk.mjs';
import vault from '../../lib/vault.js'

let prr = Promise.withResolvers(), sdk // {{{1

test.serial('load new/existing Issuer account', t => { // {{{1
  const opts = { name: 'Issuer' }
  t.timeout(180000)
  return (sdk = hXsdk({ vault })).server.loadAccount(opts).then(account => prr.promise).then(_ => {
    t.true(vault.get('Issuer.keys').length == 2)
  })
})

let watcher = fs.watch('./vault/Issuer.in', (eventType, filename) => { // {{{1
  if (filename) {
    let v = vault.get('Issuer.in')
    //console.log(`${filename} file changed! Event type: ${eventType}`, v)
    if (v) {
      prr.resolve()
      watcher.close()
    }
  }
});
