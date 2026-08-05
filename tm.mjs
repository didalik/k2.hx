import { put, reset, } from './lib/util.mjs' // {{{1
//import { closeStreams, /*startTestnetMonitor,*/ } from './lib/demo_tm.mjs'
import vault from './lib/vault.js'
//import { hXsdk } from './lib/sdk.mjs'
import { issuerEffect, stopMonitor, } from './lib/util.js'
import demouser from './src/demoit/demouser.js'
import { Asset } from '@stellar/stellar-sdk'

const params = new URLSearchParams(location.search) // {{{1
const name = params.get('demouser')
window.process = { env: {
  Networks_PUBLIC: null, // or 'hX' to use public network
}}

const out = m => typeof m == 'string' ? put(
  `<div style='text-align: right'><b>${m}</b></div>`
) : (console.log(m.message), put(m.message))

reset({
  content: document.getElementById('content1'), handleCtrlC: stopMonitor, // FIXME
})
put(`Delivered ${location} on ${Date()} to YOUR_IP_ADDRESS`, '<hr/>')

const id = 'IssuerPK'
out('demouser ' + name + ', issuerPK ' + id)

let opts = { // {{{1
  asset: {
    HEXA: new Asset('HEXA', id),
    MA: new Asset('MA', id), 
    XLM: new Asset('XLM', null) 
  },
  issuer: { id, },
  name,
  out,
  prr: Promise.withResolvers(),
  streams: [],
  timeout2trade: 5000,
  vault,
}
//let sdk = hXsdk({ out, vault: vault.init() })

try { // {{{1
  demouser.DemoTmUse(opts).catch(e => { throw e; }).then(r => {
    vault.put(`${name}.granted`, 'DONE')
  });
} catch (e) {
  console.error('UNEXPECTED', e)
  throw e; 
}

