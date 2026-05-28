import test from 'ava'; // {{{1
import { hXsdk } from '../../lib/sdk.mjs';
import vault from '../../lib/vault.js'
import { DemoSign, } from '../../lib/job.js'
import { setupActor, } from '../../lib/util.js'
import { rs4d, } from '../../demo/Ann.js'

let sdk // {{{1

test.serial('setup new/existing account for Ann', t => { // {{{1
  let issuerKeys = vault.get('Issuer.keys')
  let opts = {
    asset: 'HEXA',
    amount: '1100',
    clawback: false,
    issuer: { id: issuerKeys[1] },
    issuerKeys: [null, issuerKeys[1]],
    log: console.log,
    name: 'Ann',
    sign: (xdr, tag) => DemoSign({ secret: issuerKeys[0], vault, xdr, tag }),
    vault
  }
  t.timeout(100000)
  return setupActor(sdk = hXsdk({ vault }), opts).then(_ => {
    return rs4d(sdk, opts); // Request red snapper for dinner.
  }).then(_ => {
    vault.put('Issuer.in', 'DONE', { flag: 'a' })
    t.true(opts.destKeys.length == 2)
  });
})

