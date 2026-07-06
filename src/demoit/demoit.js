import test from 'ava'; // {{{1
import { hXsdk, } from '../../lib/sdk.mjs'
import vault from '../../lib/vault.js'
import demouser from './demouser.js'
import { Demo, DemoSign, } from './job.js'
import { Asset } from '@stellar/stellar-sdk'

test.serial('request demo', t => { // {{{1
  t.timeout(300000)
  let id = vault.get('Issuer.keys')[1]
  let opts = {
    asset: {
      HEXA: new Asset('HEXA', id),
      MA: new Asset('MA', id), 
      XLM: new Asset('XLM', null) 
    },
    issuer: { id, },
    name: process.env.demouser,
    prr: Promise.withResolvers(),
    streams: [],
    timeout2trade: 5000,
    vault,
  }
  return demouser.DemoTmUse(opts).
    then(r => {
      t.is(r, 'OK')
      vault.put(`${process.env.demouser}.granted`, 'DONE')
    });
})

test('run demo for Ann', t => { // {{{1
  t.timeout(80000)
  let issuerKeys = vault.get('Issuer.keys')
  let id = issuerKeys[1]
  let opts = {
    amount: '1100',
    asset: { 
      HEXA: new Asset('HEXA', id),
      MA: new Asset('MA', id), 
      XLM: new Asset('XLM', null) 
    },
    clawback: false,
    issuer: { id, },
    issuerKeys: [null, id],
    log: console.log,
    name: 'Ann',
    sign: (xdr, tag) => DemoSign({ secret: issuerKeys[0], vault, xdr, tag }),
    streams: [],
    vault
  }
  return (opts.sdk = hXsdk({ vault })).server.loadAccount(opts).then(account => {
    opts.recipient = account
    opts.recipientKeys = vault.get(opts.name + '.keys')
    return opts.sdk.transaction.changeTrust(opts);
  }).then(_ => {
    opts.destKeys = vault.get('Ann.keys')
    return demouser.Demo(opts).then(r => t.is(r, 'OK'));
  });
})

test(`run demo for Bob and Cyn`, t => { // {{{1
  t.timeout(80000)
  let issuerKeys = vault.get('Issuer.keys')
  let bobKeys = vault.get('Bob.keys')
  let cynKeys = vault.get('Cyn.keys')
  let destKeys = cynKeys
  let opts = {
    asset: 'HEXA',
    amount: '900',
    bobKeys,
    clawback: false,
    cynKeys,
    destKeys,
    issuerKeys: [null, issuerKeys[1]],
    log: console.log,
    sign: (xdr, tag) => DemoSign({ secret: issuerKeys[0], vault, xdr, tag }),
    streams: [],
    vault
  }
  return Demo(opts).then(r => t.is(r, 'OK'));
})

