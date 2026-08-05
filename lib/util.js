import { effectDesc, } from './api.js' // {{{1
import {
  Asset,
} from '@stellar/stellar-sdk'

let vault, cnt = 1 // {{{1

function Context (stateInitial, tag = null) { // {{{1
// see https://en.wikipedia.org/wiki/State_pattern
////
  this.state = stateInitial
  this.tag = tag
}

function delay (ms) { // {{{1
  return new Promise(resolve => setTimeout(resolve, ms));
}

function destFund (sdk, opts) { // {{{1
  return sdk.server.server.loadAccount(opts.destKeys[1]). // load the dest account
    then(account => {
      opts.account = account
      return sdk.transaction.fund(opts);                  // fund the dest account
    });
}

function issuerEffect (effect) { // {{{1
  vault ??= this.vault
  return effectDesc(effect).then(desc => {
    if (desc.txMemoType != 'none') {
      vault.put('Issuer.desc.'+cnt++, desc)
    }
    return Promise.resolve();
  });
}

function setupActor (sdk, opts/*, vault = null*/) { // {{{1
  opts.sdk ??= sdk

  vault ??= opts.vault
  return sdk.server.loadAccount(opts).then(account => {
    opts.account = opts.recipient = account
    opts.destKeys = opts.recipientKeys = vault.get(opts.name+'.keys')
    if (opts.name == 'Bob' || opts.name == 'Cyn' || opts.name.startsWith('A')) { // FIXME
      return Promise.resolve();
    }
    if (vault.get(opts.name+'.change.trust') == 'DONE') {
      return Promise.resolve();
    }
    return sdk.transaction.changeTrust(opts).then(_ => vault.put(opts.name+'.change.trust', 'DONE')).catch(e => {
      console.error('setupActor', opts.name, e?.response?.data ?? e)
    });
  }).then(_ => sdk.server.server.loadAccount(opts.destKeys[1])).then(account => {
    opts.account = opts.recipient = account
    return sdk.transaction.fund(opts).catch(e => {
      console.error('setupActor', opts.name, '*** ERROR ***', 
        e?.response?.data?.extras?.result_codes ?? e?.response?.data ?? e
      )
      if (e?.response?.data?.extras?.result_codes?.transaction == 'tx_bad_seq') {
        return sdk.server.server.loadAccount(opts.destKeys[1]).then(account => {
          opts.account = opts.recipient = account
          return sdk.transaction.fund(opts);
        });
      }
      throw e
    }).then(_ => sdk.server.server.loadAccount(opts.destKeys[1])).then(account => {
      opts.account = account
    });
  }).then(_ => {
    opts.log('-', opts.name, 'has HEXA', sdk.balance(opts.account, 'HEXA'))
    return Promise.resolve();
  });
}

function stopMonitor (r, opts) { // {{{1
  try {
  for (let stream of opts.streams) {
    stream.close()
    opts.out(`stopMonitor - "${stream.tag}" closed.`)
  }
  return Promise.resolve(r);
  } catch(e) { throw e; }
}

export { Context, delay, destFund, issuerEffect, setupActor, stopMonitor, } // {{{1

