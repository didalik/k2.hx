import test from 'ava'; // {{{1
import { hXsdk } from '../../lib/sdk.mjs';
import vault from '../../lib/vault.js'
import { DemoSign, } from '../../lib/job.js'

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
    streams: [],
    vault
  }
  t.timeout(90000)
  return (sdk = hXsdk({ vault })).server.loadAccount(opts).then(account => {
    opts.account = opts.recipient = account
    opts.destKeys = opts.recipientKeys = vault.get('Ann.keys')
    if (vault.get('Ann.change.trust') == 'DONE') {
      return Promise.resolve();
    }
    return sdk.transaction.changeTrust(opts).
      then(_ => vault.put('Ann.change.trust', 'DONE'));
  }).then(_ => sdk.transaction.fund(opts)).then(_ => {
    t.true(opts.destKeys.length == 2)
  });
})

