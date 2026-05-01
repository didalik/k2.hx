import test from 'ava'; // {{{1
import vault from '../../lib/vault.js'
import { Demo, DemoSign, DemoTmReset, DemoTmUse, } from '../../lib/job.js'

test.serial('reset test monitor', t => { // {{{1
  t.timeout(60000)
  return DemoTmReset({ vault }).then(r => {
    t.is(r, 'OK')
  })
})

test.serial('use test monitor', t => { // {{{1
  t.timeout(10000)
  return DemoTmUse().then(r => {
    t.is(r, 'OK')
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

