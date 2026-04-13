import test from 'ava'; // {{{1
import { hXsdk } from '../../lib/sdk.mjs';
import {
  //Asset, Keypair, Horizon, MemoHash, MemoText, 
  Networks, 
  //TransactionBuilder,
} from '@stellar/stellar-sdk'

//process.env.Networks_PUBLIC = 'hX'

test('default network is Networks.TESTNET', t => { // {{{1
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

test('add KNOWN property "server" to Networks.TESTNET SDK', t => { // {{{1
  t.is(hXsdk().server.server.serverURL.toString(), 'https://horizon-testnet.stellar.org/')
})

test.skip('add KNOWN property "server" to Networks.PUBLIC SDK', t => { // {{{1
  t.is(hXsdk().server.server.serverURL.toString(), 'https://horizon.stellar.org/')
})

test('access existing property "server" for Networks.TESTNET SDK', t => { // {{{1
  t.is(hXsdk().server.server.serverURL.toString(), 'https://horizon-testnet.stellar.org/')
})

test('add KNOWN property "loadAccount" to Networks.TESTNET SDK server', t => { // {{{1
  t.is(hXsdk().server.loadAccount.networkPassphrase, Networks.TESTNET)
})

