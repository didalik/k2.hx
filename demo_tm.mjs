import { put, reset, } from './lib/util.mjs' // {{{1
import { closeStreams, startTestnetMonitor, } from './lib/demo_tm.mjs'

const out = m => typeof m == 'string' ? put( // {{{1
  `<div style='text-align: right'><b>${m}</b></div>`
) : (console.log(m.message), put(m.message))

reset({ // {{{1
  content: document.getElementById('content1'), handleCtrlC: closeStreams,
})
put(`Delivered ${location} on ${Date()} to YOUR_IP_ADDRESS`, '<hr/>')

startTestnetMonitor(out) // {{{1

