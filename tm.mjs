import { put, reset, } from './lib/util.mjs' // {{{1
import { closeStreams, startTestnetMonitor, } from './lib/demo_tm.mjs'

const out = m => typeof m == 'string' ? put( // {{{1
  `<div style='text-align: right'><b>${m}</b></div>`
) : (console.log(m.message), put(m.message))

const issuerPK = 'IssuerPK'
console.log('issuerPK', issuerPK)

reset({ // {{{1
  content: document.getElementById('content1'), handleCtrlC: closeStreams,
})
put(`Delivered ${location} on ${Date()} to YOUR_IP_ADDRESS`, '<hr/>')

// TODO start JobRequest rvault
//
startTestnetMonitor(out) // {{{1

