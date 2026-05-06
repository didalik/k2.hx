import test from 'ava'; // {{{1
import vault from '../lib/vault.js'
import { DemoTmReset, DemoTmUse, } from '../lib/job.js'

let accounts // {{{1

test.serial('reset test monitor', t => { // {{{1
  t.timeout(90000)
  return DemoTmReset({ vault }).then(r => {
    accounts = r
    t.is(vault.get('accounts.setup'), 'DONE')
  })
})

test.serial('use test monitor', t => { // {{{1
  t.timeout(90000)
  let opts2 = Promise.withResolvers()
  setTimeout(_ => opts2.resolve('ok'), 60000)
  return DemoTmUse(opts2).then(r => {
    t.is(r, 'ok')
  });
})

