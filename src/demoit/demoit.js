import test from 'ava'; // {{{1
import vault from '../../lib/vault.js'
import demouser from './demouser.js'
import { Asset } from '@stellar/stellar-sdk'

test.serial('request demo', t => { // {{{1
  t.timeout(300000)
  let id = vault.get('Issuer.keys')[1]
  let opts = {
    asset: { 
      MA: new Asset('MA', id), 
      XLM: new Asset('XLM', null) 
    },
    issuer: { id, },
    name: 'Ann',
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

