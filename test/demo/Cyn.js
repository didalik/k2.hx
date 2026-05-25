import test from 'ava'; // {{{1
import { hXsdk } from '../../lib/sdk.mjs';
import vault from '../../lib/vault.js'
import { DemoSign, } from '../../lib/job.js'

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
    streams: [],
    vault
  }
  t.timeout(90000)
  return (sdk = hXsdk({ vault })).server.loadAccount(opts).then(account => {
    opts.account = opts.recipient = account
    opts.destKeys = opts.recipientKeys = vault.get('Cyn.keys')
    return sdk.transaction.changeTrust(opts);
  }).then(_ => sdk.transaction.fund(opts)).then(_ => {
    t.true(opts.destKeys.length == 2)
  });
})

