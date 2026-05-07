import test from 'ava'; // {{{1
import vault from '../lib/vault.js'
import { DemoTmReset, DemoTmUse, } from '../lib/job.js'

let accounts // {{{1

test.serial('reset test monitor', t => { // {{{1
  if (vault.get('accounts.setup') === 'DONE') {
    return t.true(true);
  }
  t.timeout(90000)
  return DemoTmReset({ vault }).then(r => {
    accounts = r
    t.is(vault.get('accounts.setup'), 'DONE')
  })
})

test.serial('use test monitor', t => { // {{{1
  if (vault.get('demo.granted') === 'DONE') { // FIXME
    return t.true(true);
  }
  t.timeout(90000)
  let opts = Promise.withResolvers()
  setTimeout(_ => opts.resolve('ok'), 60000)
  return DemoTmUse(opts).then(r => {
    t.is(r, 'ok')
  });
})

