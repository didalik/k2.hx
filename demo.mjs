import { put, reset, } from './lib/util.mjs' // {{{1
import { startDemo, toggleDivs, } from './lib/demo.mjs'

const out = m => typeof m == 'string' ? put( // {{{1
  `<div style='text-align: right'><b>${m}</b></div>`
) : (console.log(m.message), put(m.message))

reset({ content: document.getElementById('content1'), handleCtrlC: toggleDivs, }) // {{{1
put(`Delivered ${location.origin} on ${Date()} to YOUR_IP_ADDRESS`, '<hr/>')

location.search != '' && startDemo(out) // TODO check location.search value {{{1

