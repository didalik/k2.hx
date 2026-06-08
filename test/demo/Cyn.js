import test from 'ava'; // {{{1
import { hXsdk } from '../../lib/sdk.mjs';
import vault from '../../lib/vault.js'
import { DemoSign, } from '../../lib/job.js'
import { setupActor, } from '../../lib/util.js'
import { run, } from '../../demo/Cyn.js'

let sdk // {{{1

test.serial('setup new/existing account for Cyn', t => { // {{{1
  let issuerKeys = vault.get('Issuer.keys')
  let opts = {
    asset: 'HEXA',
    amount: '900',
    clawback: false,
    issuer: { id: issuerKeys[1] },
    issuerKeys: [null, issuerKeys[1]],
    log: console.log,
    name: 'Cyn',
    sign: (xdr, tag) => DemoSign({ secret: issuerKeys[0], vault, xdr, tag }),
    vault
  }
  t.timeout(200000)
  return setupActor(sdk = hXsdk({ vault }), opts).then(_ => run(sdk, opts)).then(_ => {
    vault.put('Issuer.in', 'DONE', { flag: 'a' })
    t.true(opts.destKeys.length == 2)
  });
})

