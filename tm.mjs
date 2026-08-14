import { put, reset, } from './lib/util.mjs' // {{{1
import vault from './lib/vault.js'
import { issuerEffect, stopMonitor, } from './lib/util.js'
import demouser from './src/demoit/demouser.js'
import { Asset } from '@stellar/stellar-sdk'
import { Jobs, JWT, generate_keypair, verifyPayload, } from '../../jf/public/lib/sdk.js'
import { Channel, } from '../../lib/util.mjs'
import { hXsdk, } from './lib/sdk.mjs'

let color = 'blue'; const out = m => typeof m == 'string' ? put( // {{{1
  `<div style='text-align: right; color: ${color}'>${m}</div>`
) : put(m.message)

const Demo = { // {{{1
  Running: { // {{{2
    handle: (context, event) => { // no event on first call
      if (!event) {
        setupJC(Demo, context)
        return Demo.channel.receive().then(s =>
          new JWT(s).setIssuer(Demo.client.iss, Demo.client.sk).
          setAudience(Demo.aud).sign()
        ).then(jwt => Demo.job.context.ws.send(jwt));
      }
      verifyPayload(event.message).then(payload => {
        payload.sub == 'demo EXIT CODE 0' && stopIssuerSign()
        out({ message: payload.sub })
      })
    },
  },
  onclose: data => { // {{{2
    let context = Demo.job.context
    Demo.job.resolve(`- ${context.attachment.iss.name}: Demo DONE`)
  },
  onerror: null, // is never called
  onmessage:  data => {
    let context = Demo.job.context
    context.state.handle(context, data)
  },
  prefix: context => `- ${context.attachment.iss.name}: mocking Demo job<br/>`, // }}}2
}

const IssuerSign = { // {{{1
  Running: { // {{{2
    handle: (context, event) => { // no event on first call
      if (!event) {
        setupJC(IssuerSign, context)
        return IssuerSign.channel.receive().then(s =>
          new JWT(s).setIssuer(IssuerSign.client.iss, IssuerSign.client.sk).
          setAudience(IssuerSign.aud).sign()
        ).then(jwt => IssuerSign.job.context.ws.send(jwt));
      }
      verifyPayload(event.message).then(payload => {
        out({ message: payload.sub })
      })
    },
  },
  onclose: data => { // {{{2
    let context = IssuerSign.job.context
    IssuerSign.job.resolve(`- ${context.attachment.iss.name}: IssuerSign DONE`)
  },
  onerror: null, // is never called
  onmessage:  data => {
    let context = IssuerSign.job.context
    context.state.handle(context, data)
  },
  prefix: context => `<br/>- ${context.attachment.iss.name}: mocking IssuerSign job<br/>`, // }}}2
}

const params = new URLSearchParams(location.search) // {{{1
const name = params.get('demouser')
window.process = { env: {
  Networks_PUBLIC: null, // or 'hX' to use public network
}}

let audience = ['demo', 'issuer/sign'] // {{{1

reset({ // {{{1
  content: document.getElementById('content1'), handleCtrlC: stopIssuerSign,
})
put(`Delivered ${location} on ${Date()} to YOUR_IP_ADDRESS`, '<hr/>')

const id = 'IssuerPK'
out('demouser ' + name + ', issuerPK ' + id)
vault.put('Issuer.keys', [null, id])

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
let optsIE = { name: 'Issuer', out, streams: [], vault }, sdk
let prrIE = Promise.withResolvers(), prrIEstart = Promise.withResolvers()

try { // {{{1
  streamIssuerEffects()
  demouser.DemoTmUse(opts).catch(e => { throw e; }).then(r => {
    vault.put(`${name}.granted`, 'DONE')
    put('<hr/>')
    color = 'green'
    opts.generate_keypair = generate_keypair
    opts.requests = jobRequests
    opts.Jobs = Jobs
    return demouser.runJobs(opts);
  }).then(r => console.log('jobs Demo and IssuerSign DONE, r', r));
} catch (e) {
  console.error('UNEXPECTED', e)
  throw e; 
}

function jobRequests () { // {{{1
  return audience.map(a => {
    switch (a) {
      case 'issuer/sign': return Object.assign(IssuerSign, { aud: a });
      case 'demo': return Object.assign(Demo, { aud: a });
      default: throw Error('UNEXPECTED aud', aud);
    }
  });
}

function setupJC (job, context) { // setup job channel {{{1
  if (job.channel) {
    return;
  }
  //console.log('setupJC context', context, 'job', job)

  job.channel = new Channel()
  job.client = context.attachment
  job.channel.send(`setupJC ${name} setting up ${context.opts.aud}...\n`)
  if (job === Demo) {
    prrIEstart.resolve()
    out('setupJC mocking job Demo...')
    setTimeout(_ => {
      Demo.channel.send('context.job.stdin.end()')
      Demo.Running.handle(Demo.job.context)
    }, 1000)
  }
}

function stopIssuerSign () { // {{{1
  out('stopIssuerSign: stopping job IssuerSign...')
  IssuerSign.channel.send('context.job.stdin.end()')
  IssuerSign.Running.handle(IssuerSign.job.context)

  stopMonitor(null, optsIE); prrIE.resolve()
}

function streamIssuerEffects () { // {{{1
  prrIEstart.promise.then(_ => {
    (sdk = hXsdk({ out, vault })).addStream(
      optsIE,
      "Issuer's effects",
        [
          ['account_credited', issuerEffect],
          ['account_debited', issuerEffect],
          ['claimable_balance_claimant_created', issuerEffect],
          ['claimable_balance_claimed', issuerEffect],
        ], 
        id,
        true // now
    )
    prrIE.promise.then(_ => out(JSON.stringify({ 
      f: 'streamIssuerEffects', stoppedOn: new Date() 
    })));
  });
}

