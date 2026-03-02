import { put, reset, } from './lib/util.mjs' // {{{1
import { addStream, makeBuyOffer, trustAssets, } from '../lib/sdk.mjs'
import { Asset, Keypair, Horizon, Networks, TransactionBuilder, } from '@stellar/stellar-sdk'

const out = m => typeof m == 'string' ? put( // {{{1
  `<div style='text-align: right'><b>${m}</b></div>`
) : (console.log(m.message), put(m.message))

reset({ content: document.getElementById('content1'), handleCtrlC }) // {{{1
put(`Delivered ${location} on ${Date()} to YOUR_IP_ADDRESS`, '<hr/>')

let MA = new Asset('MA', 'MA_IssuerPK')

let vm = { // {{{1
  s: [],
  e: { log: console.log, nw: Networks.TESTNET,
    server: new Horizon.Server("https://horizon-testnet.stellar.org"),
  },
  c: {},
  d: { MA: new Asset('MA', 'MA_IssuerPK'), XLM: new Asset('XLM', null), }
}
let ma = vm.d.MA
let secret = Keypair.random().secret() // TODO use localStorage

let kp = Keypair.fromSecret(secret); vm.d.kp = kp // {{{1
let pk = kp.publicKey()
if (!vm.c.done) {
  out({ message: 'Loading your Stellar TESTNET account... ' })
  vm.e.server.loadAccount(pk).then(account => loaded.call(vm, account))
  .catch(error => {
    if (!vm.c.done) {
      out(`${error.message}`)
      if (error.message == 'Not Found') {
        out({ message: 'Creating your Stellar TESTNET account... ' })
        fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(pk)}`).
        then(response => response.json()).then(json => {
          console.log('new TESTNET account created: txId', json.id)
          out(`new account created, pk ${pk}`)
          out({ message: 'Loading your Stellar TESTNET account... ' })
        }).then(_ => vm.e.server.loadAccount(pk)).
        then(account => loaded.call(vm, account)).
        catch(error => console.error(error))
      }
    }
  })
}

function loaded (account) { // {{{1
  let { s, e, c, d } = this
  out('loaded.')
  if (account.balances.length == 1) {
    out({ message: 'Updating your trustline... ' })
    trustAssets.call(this, account, d.kp, '10000', d.MA).then(txId => {
      e.log('trustline updated: txId', txId)
      out('updated.')
      out({ message: 'Requesting the demo...' })
      makeBuyOffer.call(vm, vm.d.kp, account, vm.d.MA, vm.d.XLM, '1', '1').
        then(_ => { vm.d.offerMade = true })
    }).then(_ => e.server.loadAccount(d.kp.publicKey())).then(account => {
      run.call(this, account)
    })
  } else {
    run.call(this, account)
  }
}

function run (account) { // {{{1
  let { s, e, c, d } = this
  let trade = effect => {
    e.log('run trade effect', effect)
    out('Demo request GRANTED')
    handleCtrlC()
    out('DONE')
  }
  d.account = account
  addStream.call(this,
    "user's trading effects",
    [
      ['trade', trade]
    ],
    account.id //, true
  )
}

let ob = vm.e.server.orderbook(vm.d.MA, vm.d.XLM).cursor('now') // {{{1
vm.s.push({
  close: ob.stream({
    onerror:   e => { throw e; },
    onmessage: e => {
      console.dir(e, { depth: null })
      vm.e.log(vm)
    }
  }),
  tag: 'orderbook',
})

function handleCtrlC () { // {{{1
  for (let stream of vm.s) {
    stream.close()
    out(`stream "${stream.tag}" closed`)
  }
}

