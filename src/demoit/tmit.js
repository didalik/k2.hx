import test from 'ava'; // {{{1
import vault from '../../lib/vault.js'
import { DemoTmReset, DemoTmUse, } from './job.js'

test.serial('reset test monitor', t => { // {{{1
  t.timeout(90000)
  return DemoTmReset({ vault }).then(r => {
    //accounts = r // { issuer, bob, cyn }
    t.is(vault.get('accounts.set'), 'DONE')
  })
})

test.serial('use test monitor', t => { // {{{1
  t.timeout(90000)
  let opts = { prr: Promise.withResolvers() }
  opts.timeoutId = setTimeout(
    _ => opts.prr.resolve('ok'), 
    40000
  )
  return DemoTmUse(opts).then(r => {
    t.is(r, 'ok')
  });
})

