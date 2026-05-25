import test from 'ava'; // {{{1
import { hXsdk } from '../../lib/sdk.mjs';
import vault from '../../lib/vault.js'

let sdk // {{{1

test.serial('load new/existing Issuer account', t => { // {{{1
  const opts = { name: 'Issuer' }
  t.timeout(20000)
  return (sdk = hXsdk({ vault })).server.loadAccount(opts).then(account => {
    t.true(vault.get('Issuer.keys').length == 2)
  })
})

