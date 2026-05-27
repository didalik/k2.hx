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
  t.timeout(100000)
  return (sdk = hXsdk({ vault })).server.loadAccount(opts).then(account => {
    opts.account = opts.recipient = account
    opts.destKeys = opts.recipientKeys = vault.get(opts.name+'.keys')
    if (vault.get(opts.name+'.change.trust') == 'DONE') {
      return Promise.resolve();
    }
    return sdk.transaction.changeTrust(opts).
      then(_ => vault.put(opts.name+'.change.trust', 'DONE'));
  }).then(_ => {
    if (vault.get(opts.name+'.fund.HEXA') == 'DONE') {
      return Promise.resolve();
    }
    return sdk.transaction.fund(opts).
      then(_ => vault.put(opts.name+'.fund.HEXA', 'DONE'));
  }).then(_ => {
    opts.log('-', opts.name, 'has HEXA', sdk.balance(opts.account, 'HEXA'))
    return Promise.resolve();
  }).then(_ => {
    vault.put('Issuer.in', 'DONE', { flag: 'a' })
    t.true(opts.destKeys.length == 2)
  });
})

