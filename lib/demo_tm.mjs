import { // {{{1
  addStream, makeBuyOffer, trustAssets,
} from '../../lib/sdk.mjs'
import {
  Asset, Keypair, Horizon, Networks, TransactionBuilder,
} from '@stellar/stellar-sdk'

let out // {{{1

let vm = { // {{{1
  s: [],
  e: { log: console.log, nw: Networks.TESTNET,
    server: new Horizon.Server("https://horizon-testnet.stellar.org"),
  },
  c: {},
  d: { MA: new Asset('MA', 'MA_IssuerPK'), XLM: new Asset('XLM', null), }
}
let secret = Keypair.random().secret() // TODO use localStorage

function closeStreams () { // {{{1
  for (let stream of vm.s) {
    stream.close()
    out(`stream "${stream.tag}" closed`)
  }
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
    window.open(location.href.slice(0, -3))
    closeStreams()
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

function startTestnetMonitor (_out) { // {{{1
  out = _out
  let kp = Keypair.fromSecret(secret); vm.d.kp = kp // {{{2
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
  let ob = vm.e.server.orderbook(vm.d.MA, vm.d.XLM).cursor('now') // {{{2
  vm.s.push({
    close: ob.stream({
      onerror:   e => { throw e; },
      onmessage: e => {
        console.dir(e, { depth: null })
        vm.e.log(vm)
      }
    }),
    tag: 'orderbook',
  }) // }}}2
}

export { closeStreams, startTestnetMonitor, } // {{{1

