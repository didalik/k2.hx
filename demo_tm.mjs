import { put, reset, } from './lib/util.mjs' // {{{1
import { Asset, Keypair, Horizon, Networks, TransactionBuilder, } from '@stellar/stellar-sdk'

const out = m => typeof m == 'string' ? put( // {{{1
  `<div style='text-align: right'><b>${m}</b></div>`
) : (console.log(m.message), put(m.message))

reset({ content: document.getElementById('content1'), }) // {{{1
put(`Delivered ${location} on ${Date()} to YOUR_IP_ADDRESS`, '<hr/>')

let MA = new Asset('MA', 'MA_IssuerPK')
out(MA.toString())
