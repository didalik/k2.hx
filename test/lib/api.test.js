import test from 'ava'; // {{{1
import { hXsdk } from '../../lib/sdk.mjs';
import vault from '../../lib/vault.js'

let accounts = {}, sdk // {{{1

test.serial('load new/existing Issuer account', t => { // {{{1
  const opts = { name: 'Issuer' }
  t.timeout(200000)
  return (sdk = hXsdk({ vault })).server.loadAccount(opts).then(account => {
    t.true(account.balances[0].asset_type == 'native')
    //console.log('sdk', sdk)
    accounts.issuer = account
    accounts.issuerKeys = vault.get('Issuer.keys')
  })
})

test.serial('load new/existing account for Ann', t => { // {{{1
  delete sdk.server.opts4loadAccount.account
  sdk.server.opts4loadAccount.name = 'Ann'
  if (sdk.transaction?.opts4createAccount?.defaults?.opts) {
    sdk.transaction.opts4createAccount.defaults.opts = {}
  }
  t.timeout(100000)
  return sdk.server.loadAccount(sdk.server.opts4loadAccount).then(account => {
    t.true(account.balances.length > 0)
    //console.log('sdk', sdk)
    accounts.agent = account
    accounts.agentKeys = vault.get('Ann.keys')
  })
})

test.serial('load new/existing account for Bob', t => { // {{{1
  delete sdk.server.opts4loadAccount.account
  sdk.server.opts4loadAccount.name = 'Bob'
  if (sdk.transaction?.opts4createAccount?.defaults?.opts) {
    sdk.transaction.opts4createAccount.defaults.opts = {}
  }
  t.timeout(100000)
  return sdk.server.loadAccount(sdk.server.opts4loadAccount).then(account => {
    t.true(account.balances.length > 0)
    //console.log('sdk', sdk)
    accounts.agent = account
    accounts.agentKeys = vault.get('Bob.keys')
  })
})

