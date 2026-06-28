import test from 'ava'; // {{{1
import vault from '../../lib/vault.js'
import { DemoDone, } from './job.js'
import { Asset } from '@stellar/stellar-sdk'

test.serial('demo done', t => { // {{{1
  t.timeout(80000)
  let id = vault.get('Issuer.keys')[1]
  let opts = {
    asset: { 
      MA: new Asset('MA', id), 
      XLM: new Asset('XLM', null) 
    },
    issuer: { id, },
    vault,
  }
  return DemoDone(opts).
    then(r => t.is(r, 'OK'));
})

