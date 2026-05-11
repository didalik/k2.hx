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
  let userKeys = vault.get(process.env.demouser + '.keys')
  let opts = {
    issuerPK: issuerKeys[1],
    sign: (xdr, tag) => DemoSign({ secret: issuerKeys[0], vault, xdr, tag }),
    userKeys,
    vault
  }
  return DemoUser(opts).then(r => t.is(r, 'OK'));
})

test(`run demo for Bob and Cyn`, t => { // {{{1
  t.timeout(80000)
  let opts = {}
  return Demo(opts).then(r => t.is(r, 'OK'));
})

