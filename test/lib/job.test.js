import test from 'ava'; // {{{1
import vault from '../../lib/vault.js'
import { Demo, DemoSign, DemoTmReset, DemoTmUse, DemoTmUseRequest, } from '../../lib/job.js'

test.serial('reset test monitor', t => { // {{{1
  t.timeout(90000)
  return DemoTmReset({ vault }).then(r => {
    t.is(r, 'OK')
  })
})

test.serial('use test monitor', t => { // {{{1
  t.timeout(90000)
  let opts = Promise.withResolvers()
  DemoTmUseRequest({ name: 'user1' }).then(_ => (console.log(_), opts.resolve('ok')))
  return DemoTmUse(opts).then(r => {
    t.is(r, 'ok')
  });
})

test.serial('unit-test DemoSign', t => { // {{{1
  t.timeout(10000)
  return DemoSign().then(r => {
    t.is(r, 'OK')
  })
})

test.serial('run the demo', t => { // {{{1
  t.timeout(10000)
  return Demo().then(r => {
    t.is(r, 'OK')
  })
})

