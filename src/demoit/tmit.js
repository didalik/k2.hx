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
  t.timeout(300000)
  let timeout = 60000, opts = {
    prr: Promise.withResolvers(),
    timeoutTM: 7000,
    timeout2trade: 5000,
  }
  opts.timeoutId = setTimeout(
    _ => opts.prr.resolve(`outer timeout ${timeout} ms`), 
    timeout
  )

  let watcher = vault.watch(null, (eventType, filename) => { // {{{2
    if (eventType == 'change' && filename == 'tm.down') {
      watcher.close()
      opts.prr.resolve('ok')
    }
  }); // }}}2

  return DemoTmUse(opts).then(r => {
    t.is(r, 'ok')
  });
})

