import test from 'ava'; // {{{1
import vault from '../lib/vault.js'
import { Demo, DemoSign, DemoTmUseRequest, DemoUser, } from '../lib/job.js'
import { Asset, /*Keypair,*/ } from '@stellar/stellar-sdk'

test.serial('request demo', t => { // {{{1
  if (vault.get('demo.granted') === 'DONE') { // FIXME
    return t.true(true);
  }
  t.timeout(80000)
  let id = vault.get('Issuer.keys')[1]
  let opts = {
    asset: { MA: new Asset('MA', id), XLM: new Asset('XLM', null) },
    issuer: { id, },
    name: process.env.demouser,
    vault,
  }
  return DemoTmUseRequest(opts).then(r => t.is(r, 'XOXOXO'));
})

test(`run demo for user ${process.env.demouser}`, t => { // {{{1
  t.timeout(80000)
  let issuerKeys = vault.get('Issuer.keys')
  let destKeys = vault.get(process.env.demouser + '.keys')
  let opts = {
    asset: 'HEXA',
    amount: '1100',
    clawback: false,
    destKeys,
    issuerKeys: [null, issuerKeys[1]],
    log: console.log,
    sign: (xdr, tag) => DemoSign({ secret: issuerKeys[0], vault, xdr, tag }),
    vault
  }
  return DemoUser(opts).then(r => t.is(r, 'OK'));
})

test(`run demo for Bob and Cyn`, t => { // {{{1
  t.timeout(80000)
  let issuerKeys = vault.get('Issuer.keys')
  let destKeys = vault.get('Cyn.keys')
  let opts = {
    asset: 'HEXA',
    amount: '1000',
    clawback: false,
    destKeys,
    issuerKeys: [null, issuerKeys[1]],
    sign: (xdr, tag) => DemoSign({ secret: issuerKeys[0], vault, xdr, tag }),
    vault
  }
  return Demo(opts).then(r => t.is(r, 'OK'));
})

