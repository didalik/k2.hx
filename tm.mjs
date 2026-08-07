import { put, reset, } from './lib/util.mjs' // {{{1
import vault from './lib/vault.js'
import { issuerEffect, stopMonitor, } from './lib/util.js'
import demouser from './src/demoit/demouser.js'
import { Asset } from '@stellar/stellar-sdk'
import { Jobs, Offers, generate_keypair, } from '../../jf/public/lib/sdk.js'

const params = new URLSearchParams(location.search) // {{{1
const name = params.get('demouser')
window.process = { env: {
  Networks_PUBLIC: null, // or 'hX' to use public network
}}

let color = 'blue'; const out = m => typeof m == 'string' ? put( // {{{1
  `<div style='text-align: right; color: ${color}'>${m}</div>`
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

try { // {{{1
  demouser.DemoTmUse(opts).catch(e => { throw e; }).then(r => {
    vault.put(`${name}.granted`, 'DONE')
    color = 'green'
    opts.generate_keypair = generate_keypair
    opts.requests = Offers
    opts.Jobs = Jobs
    return demouser.startDemo(opts);
  });
} catch (e) {
  console.error('UNEXPECTED', e)
  throw e; 
}

