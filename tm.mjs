import { put, reset, } from './lib/util.mjs' // {{{1
import { closeStreams, /*startTestnetMonitor,*/ } from './lib/demo_tm.mjs'
import { hXsdk } from './lib/sdk.mjs'
import { issuerEffect, stopMonitor, } from './lib/util.js'

window.process = { env: {
  Networks_PUBLIC: null, // or 'hX'
}}

let vault
let sdk = hXsdk({ vault })

const out = m => typeof m == 'string' ? put( // {{{1
  `<div style='text-align: right'><b>${m}</b></div>`
) : (console.log(m.message), put(m.message))

const issuerPK = 'IssuerPK'
const params = new URLSearchParams(location.search)
console.log('issuerPK', issuerPK, 'demouser', params.get('demouser'), 'sdk', sdk)

reset({ // {{{1
  content: document.getElementById('content1'), handleCtrlC: closeStreams,
})
put(`Delivered ${location} on ${Date()} to YOUR_IP_ADDRESS`, '<hr/>')

// TODO start JobRequest rvault
//
//startTestnetMonitor(out) // {{{1

