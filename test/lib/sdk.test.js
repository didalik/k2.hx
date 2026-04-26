import test from 'ava'; // {{{1
import { hXsdk } from '../../lib/sdk.mjs';
import vault from '../../lib/vault.js'
import {
  //Asset, Keypair, Horizon, MemoHash, MemoText, 
  Networks, 
  //TransactionBuilder,
} from '@stellar/stellar-sdk'

//process.env.Networks_PUBLIC = 'hX'

let accounts = {}, sdk // {{{1

test.serial('default network is Networks.TESTNET', t => { // {{{1
  t.is(hXsdk().networkPassphrase, Networks.TESTNET);
});

test.skip('to use Networks.PUBLIC, set process.env.Networks_PUBLIC to "hX"', t => { // {{{1
  t.is(hXsdk().networkPassphrase, Networks.PUBLIC);
});

test.skip(//if proc...Networks_PUBLIC is set to anything else than hX, an error is thrown {{{1
'if process.env.Networks_PUBLIC is set to anything else than "hX", an error is thrown',
t => {
  process.env.Networks_PUBLIC = 'XA'
  t.throws(hXsdk, { message: 'Invalid process.env.Networks_PUBLIC XA' })
  process.env.Networks_PUBLIC = 'hX'
});

test.serial('add KNOWN property "server" to Networks.TESTNET SDK', t => { // {{{1
  t.is(hXsdk().server.server.serverURL.toString(), 'https://horizon-testnet.stellar.org/')
})

test.skip('add KNOWN property "server" to Networks.PUBLIC SDK', t => { // {{{1
  t.is(hXsdk().server.server.serverURL.toString(), 'https://horizon.stellar.org/')
})

test.serial('access cached property "server" for Networks.TESTNET SDK', t => { // {{{1
  t.is(hXsdk().server.server.serverURL.toString(), 'https://horizon-testnet.stellar.org/')
})

test.serial('load new/existing Issuer account', t => { // {{{1
  const opts = { name: 'Issuer' }
  t.timeout(20000)
  return (sdk = hXsdk({ vault })).server.loadAccount(opts).then(account => {
    t.true(account.balances[0].asset_type == 'native')
    //console.log('sdk', sdk)
    accounts.issuer = account
  })
})

test.serial('load new/existing Agent account', t => { // {{{1
  delete sdk.server.opts4loadAccount.account
  sdk.server.opts4loadAccount.name = 'Bob'
  if (sdk.transaction?.opts4createAccount?.defaults?.opts) {
    sdk.transaction.opts4createAccount.defaults.opts = {}
  }
  t.timeout(10000)
  return sdk.server.loadAccount(sdk.server.opts4loadAccount).then(account => {
    t.true(account.balances[0].asset_type == 'native')
    //console.log('sdk', sdk)
    accounts.agent = account
  })
})

test.serial('change trust of the loaded Agent/Issuer using defaults', t => { // {{{1
  const opts = { issuer: accounts.issuer, recipient: accounts.agent }
  t.timeout(10000)
  return sdk.transaction.changeTrust(opts).then(result => {
    t.is(result, 'XA')
    console.log('sdk', sdk)
  })
})

