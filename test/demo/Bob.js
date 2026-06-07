import test from 'ava'; // {{{1
import { hXsdk } from '../../lib/sdk.mjs';
import vault from '../../lib/vault.js'
import { DemoSign, } from '../../lib/job.js'
import { setupActor, } from '../../lib/util.js'
import { fcrs, } from '../../demo/Bob.js'

let sdk // {{{1

test.serial('setup new/existing account for Bob', t => { // {{{1
  let issuerKeys = vault.get('Issuer.keys')
  let opts = {
    asset: 'HEXA',
    amount: '100',
    clawback: false,
    issuer: { id: issuerKeys[1] },
    issuerKeys: [null, issuerKeys[1]],
    log: console.log,
    name: 'Bob',
    //nolog: true,
    sign: (xdr, tag) => DemoSign({ secret: issuerKeys[0], vault, xdr, tag }),
    vault
  }
  t.timeout(200000)
  return setupActor(sdk = hXsdk({ vault }), opts).then(_ => {
    return fcrs(sdk, opts); // Offer freshly caught red snapper.
  }).then(_ => {
    vault.put('Issuer.in', 'DONE', { flag: 'a' })
    t.true(opts.destKeys.length == 2)
  });
})

