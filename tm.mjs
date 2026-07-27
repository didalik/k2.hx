import { put, reset, } from './lib/util.mjs' // {{{1
import { closeStreams, /*startTestnetMonitor,*/ } from './lib/demo_tm.mjs'
import vault from './lib/vault.js'
import { hXsdk } from './lib/sdk.mjs'
import { issuerEffect, stopMonitor, } from './lib/util.js'
import demouser from './src/demoit/demouser.js'
import { Asset } from '@stellar/stellar-sdk'

const params = new URLSearchParams(location.search) // {{{1
const name = params.get('demouser')
window.process = { env: {
  Networks_PUBLIC: null, // or 'hX' to use public network
}}

let sdk = hXsdk({ vault: vault.init() })

const out = m => typeof m == 'string' ? put(
  `<div style='text-align: right'><b>${m}</b></div>`
) : (console.log(m.message), put(m.message))

const id = 'IssuerPK'
console.log('id', id, 'demouser', name, 'sdk', sdk)

reset({
  content: document.getElementById('content1'), handleCtrlC: closeStreams,
})
put(`Delivered ${location} on ${Date()} to YOUR_IP_ADDRESS`, '<hr/>')

let opts = { // {{{1
  asset: {
    HEXA: new Asset('HEXA', id),
    MA: new Asset('MA', id), 
    XLM: new Asset('XLM', null) 
  },
  issuer: { id, },
  name,
  prr: Promise.withResolvers(),
  streams: [],
  timeout2trade: 5000,
  vault,
}
try {
  demouser.DemoTmUse(opts).catch(e => { throw e; }).then(r => {
    vault.put(`${process.env.demouser}.granted`, 'DONE')
  });
} catch (e) { throw e; }
