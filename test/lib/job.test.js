import test from 'ava'; // {{{1
import vault from '../../lib/vault.js'
import { Demo, DemoSign, DemoTmReset, DemoTmUse, DemoTmUseRequest, } from '../../lib/job.js'

test.serial('reset test monitor', t => { // {{{1
  t.timeout(90000)
  return DemoTmReset({ vault }).then(r => {
    t.is(r, 'OK')
  })
})

test.serial('use test monitor, 3 users', t => { // {{{1
  t.timeout(10000)
  let users = ['user1', 'user2', 'user3'], requests = [], opts = Promise.withResolvers()
  for (const name of users) {
    requests.push(DemoTmUseRequest({ name }))
  }
  Promise.all(requests).then(_ => opts.resolve('ok'))
  return DemoTmUse(opts).then(r => {
    t.is(r, 'ok')
  })
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

