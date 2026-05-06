import test from 'ava'; // {{{1
import vault from '../lib/vault.js'
import { DemoTmUseRequest, } from '../lib/job.js'
import { Asset, /*Keypair,*/ } from '@stellar/stellar-sdk'

test.serial('request demo', t => { // {{{1
  t.timeout(70000)
  let id = vault.get('Issuer.keys')[1]
  let opts = {
    asset: { MA: new Asset('MA', id), XLM: new Asset('XLM', null) },
    issuer: { id, },
    name: 'user1',
    vault,
  }
  return DemoTmUseRequest(opts).then(r => t.is(r, 'XOXOXO'));
})

