import { effectDesc, } from './api.js' // {{{1
import vault from './vault.js'

let count = 1 // {{{1

function Context (stateInitial, tag = null) { // {{{1
// see https://en.wikipedia.org/wiki/State_pattern
////
  this.state = stateInitial
  this.tag = tag
  //console.log('new Context tag', tag)
 
}

function destFund (sdk, opts) { // {{{1
  return sdk.server.server.loadAccount(opts.destKeys[1]). // load the dest account
    then(account => {
      opts.account = account
      return sdk.transaction.fund(opts);                  // fund the dest account
    });
}

function issuerClaimant (effect) { // {{{1
  return effectDesc(effect).then(desc => {
    vault.put('Issuer.desc.'+count++, desc)

    /*if (desc.amount == HEX_KEY && desc.txDesc == '') {
      this.context.state = stateCynAnnDeal
      return stateInitial.resolve(desc);
    }*/
    return Promise.resolve();
  });
}

function setupActor (sdk, opts) { // {{{1
  opts.sdk ??= sdk

  let vault = opts.vault
  return sdk.server.loadAccount(opts).then(account => {
    opts.account = opts.recipient = account
    opts.destKeys = opts.recipientKeys = vault.get(opts.name+'.keys')
    if (vault.get(opts.name+'.change.trust') == 'DONE') {
      return Promise.resolve();
    }
    return sdk.transaction.changeTrust(opts).
      then(_ => vault.put(opts.name+'.change.trust', 'DONE'));
  }).then(_ => {
    if (vault.get(opts.name+'.fund.HEXA') == 'DONE') {
      return Promise.resolve();
    }
    return sdk.transaction.fund(opts).then(_ => sdk.server.server.loadAccount(opts.destKeys[1])).then(account => {
      opts.account = account
    }).then(_ => vault.put(opts.name+'.fund.HEXA', 'DONE'));
  }).then(_ => {
    opts.log('-', opts.name, 'has HEXA', sdk.balance(opts.account, 'HEXA'))
    return Promise.resolve();
  });
}

function stopMonitor (r, opts) { // {{{1
  for (let stream of opts.streams) {
    stream.close()
    console.log(`stopMonitor - "${stream.tag}" closed.`)
  }
  return Promise.resolve(r);
}

export { Context, destFund, issuerClaimant, setupActor, stopMonitor, } // {{{1

