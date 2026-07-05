import { effectDesc, } from './api.js' // {{{1
import vault from './vault.js'
import {
  Asset,
} from '@stellar/stellar-sdk'

let count = 1 // {{{1

function Context (stateInitial, tag = null) { // {{{1
// see https://en.wikipedia.org/wiki/State_pattern
////
  this.state = stateInitial
  this.tag = tag
  //console.log('new Context tag', tag)
 
}

function asset (opts, code = 'HEXA') { // {{{1
  return typeof opts.asset == 'string' ?
    new Asset(opts.asset, opts.issuerKeys[1])
    : opts.asset[code];
}

function delay (ms) { // {{{1
  return new Promise(resolve => setTimeout(resolve, ms));
}

function destFund (sdk, opts) { // {{{1
  //console.log('destFund opts', opts)

  return sdk.server.server.loadAccount(opts.destKeys[1]). // load the dest account
    then(account => {
      opts.account = account
      return sdk.transaction.fund(opts);                  // fund the dest account
    });
}

function issuerEffect (effect) { // {{{1
  return effectDesc(effect).then(desc => {
    if (desc.txMemoType != 'none') {
      vault.put('Issuer.desc.'+count++, desc)
    }
    return Promise.resolve();
  });
}

function setupActor (sdk, opts, vault = null) { // {{{1
  opts.sdk ??= sdk

  vault ??= opts.vault
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
    console.log(`\rstopMonitor - "${stream.tag}" closed.\r`)
  }
  return Promise.resolve(r);
}

export { Context, asset, delay, destFund, issuerEffect, setupActor, stopMonitor, } // {{{1

