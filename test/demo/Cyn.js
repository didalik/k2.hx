import test from 'ava'; // {{{1
import { hXsdk } from '../../lib/sdk.mjs';
import { DemoSign, } from '../../lib/job.js'
import { setupActor, } from '../../lib/util.js'
import { goCyn, } from '../../demo/Cyn.js'
import fs from 'fs'
import vault from '../../lib/vault.js'
vault.init(fs)

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
    vault: vault.init(fs),
  }
  t.timeout(200000)
  return setupActor(sdk = hXsdk({ out: console.log, vault }), opts).then(_ => goCyn(sdk, opts)).then(_ => {
    vault.put('Issuer.in', 'DONE', { flag: 'a' })
    t.true(opts.destKeys.length == 2)
  });
})

