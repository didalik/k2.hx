import test from 'ava'; // {{{1
import { hXsdk } from '../../lib/sdk.mjs';
import {
  //Asset, Keypair, Horizon, MemoHash, MemoText, 
  Networks, 
  //TransactionBuilder,
} from '@stellar/stellar-sdk'

test('default network is Networks.TESTNET', t => { // {{{1
  t.is(hXsdk().networkPassphrase, Networks.TESTNET);
});

test('to use Networks.PUBLIC, set process.env.Networks_PUBLIC to "hX"', t => { // {{{1
  process.env.Networks_PUBLIC = 'hX'
  t.is(hXsdk().networkPassphrase, Networks.PUBLIC);
});

test(//if proc...Networks_PUBLIC is set to anything else than hX, throw an error{{{1
'if process.env.Networks_PUBLIC is set to anything else than "hX", throw an error',
t => {
  process.env.Networks_PUBLIC = 'XA'
  t.throws(hXsdk, { message: 'Invalid process.env.Networks_PUBLIC XA' })
  delete process.env.Networks_PUBLIC
});

test('add KNOWN property "server" to Networks.TESTNET SDK', t => { // {{{1
  t.is(hXsdk().server.networkPassphrase, Networks.TESTNET)
})

test('add KNOWN property "server" to Networks.PUBLIC SDK', t => { // {{{1
  process.env.Networks_PUBLIC = 'hX'
  //t.log('process.env.Networks_PUBLIC', process.env.Networks_PUBLIC)
  t.is(hXsdk().server.networkPassphrase, Networks.PUBLIC)
  delete process.env.Networks_PUBLIC
})

test('access property "server" for Networks.TESTNET SDK again', t => { // {{{1
  t.is(hXsdk().server.networkPassphrase, Networks.TESTNET)
})

