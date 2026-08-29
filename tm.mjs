import { put, reset, } from './lib/util.mjs' // {{{1
import vault from './lib/vault.js'
import { issuerEffect, setupActor, stopMonitor, } from './lib/util.js'
import demouser from './src/demoit/demouser.js'
import { Asset } from '@stellar/stellar-sdk'
import { Jobs, JWT, generate_keypair, verifyPayload, } from '../../jf/public/lib/sdk.js'
import { Channel, } from '../../lib/util.mjs'
import { hXsdk, } from './lib/sdk.mjs'
import { rs4d, } from './demo/Ann.js'

let color = 'blue'; const out = m => typeof m == 'string' ? put( // {{{1
  `<div style='text-align: right; color: ${color}'>${m}</div>`
) : put(m.message?.replaceAll('\n', '<br/>').replaceAll(' ', '&nbsp'))

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
        handlePayload(payload) && out({ message: payload.sub })
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
  prefix: context => `- ${context.attachment.iss.name}: mocking Demo job<br/>`,
  prrSetup: Promise.withResolvers(),
  prrStart: Promise.withResolvers(), prrStop: Promise.withResolvers(),
  // }}}2
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
        if (payload.sub.startsWith('signed ')) {
          IssuerSign.prr.resolve(payload.sub.slice(7))
          return;
        }
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
  prefix: context => `<br/>- ${context.attachment.iss.name}: mocking IssuerSign job<br/>`, 
  prrSetup: Promise.withResolvers(),
  // }}}2
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
document.getElementById('more-tabs').innerHTML = "<a href='"+location+'>'+"' target='_blank'>here</a>"
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
let prrIEstop = Promise.withResolvers(), prrIEstart = Promise.withResolvers(), prrRIEon = Promise.withResolvers()

try { // {{{1
  runDemo() // start after streamIssuerEffects is on
  streamIssuerEffects() // start after demouser.DemoTmUse grants demo request and remote issuer's effects are on
  demouser.DemoTmUse(opts).catch(e => { throw e; }).then(r => {
    vault.put(`${name}.granted`, 'DONE')
    put('<hr/>'); document.title = 'hX demo'
    //localStorage.clear() // FIXME
    prrIEstart.resolve()
    color = 'green'; out('demo request granted')
    opts.generate_keypair = generate_keypair
    opts.requests = jobRequests
    opts.Jobs = Jobs
    return demouser.runJobs(opts);
  }).then(r => console.log('jobs Demo and IssuerSign DONE, r', r)).then(_ => 
    prrIEstop.promise.then(_ => {
      out('All DONE ' + JSON.stringify({ f: 'streamIssuerEffects', stoppedOn: new Date() }))
      put('<hr/>'); document.title = 'DONE'
      put('<div style="text-align:center">When DONE, please run<br/>localStorage.clear()<br/>Thanks!</div>')
    })
  );
} catch (e) {
  console.error('UNEXPECTED', e)
  throw e; 
}

function handlePayload (payload) { // {{{1
  //console.log('handlePayload payload', payload)

  switch (payload.sub) {
    case 'sdk.addStream "Issuer\'s effects" DONE\n':
      prrRIEon.resolve(); return true;
    case 'demo EXIT CODE 0':
      stopIssuerSign(); return true;
    default:
      return true;
  }
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

function runDemo () { // {{{1
  Demo.prrStart.promise.then(_ => {
    out('runDemo started on ' + new Date())
    let opts = {
      asset: 'HEXA',
      amount: '1100',
      clawback: false,
      issuer: { id },
      issuerKeys: [null, id],
      log: out,
      name,
      //nolog: true,
      sign: (...args) => { // (xdr, tag) => DemoSign({ secret: issuerKeys[0], vault, xdr, tag }),
        IssuerSign.prr = Promise.withResolvers()
        IssuerSign.channel.send(JSON.stringify(args)+'\n')
        IssuerSign.Running.handle(IssuerSign.job.context)
        return IssuerSign.prr.promise;
      },
      vault
    }
    return setupActor(sdk = hXsdk({ out, vault }), opts).then(_ => {
      return rs4d(sdk, opts); // Request red snapper for dinner.
    }).then(_ => Demo.prrStop.resolve('OK')).then(r => {
      return Demo.prrStop.promise.then(r => out('runDemo ' + r + ' stopped on ' + new Date()));
    });
  });
}

function setupJC (job, context) { // setup job channel {{{1
  if (job.channel) {
    return;
  }
  job.channel = new Channel()
  job.client = context.attachment
  job.channel.send(`setupJC ${name} setting up ${context.opts.aud}...\n`)
  if (job === Demo) {
    setTimeout(_ => { // close upstream to start remote job demo
      Demo.channel.send('context.job.stdin.end()')
      Demo.Running.handle(Demo.job.context)
      //Demo.prrStop.resolve() // stop demo
    }, 1000)
  }
  job.prrSetup.resolve()
  //console.log('setupJC context', context, 'job', job)

}

function stopIssuerSign () { // {{{1
  out('stopIssuerSign: stopping job IssuerSign...')
  IssuerSign.channel.send('context.job.stdin.end()')
  IssuerSign.Running.handle(IssuerSign.job.context)

  //stopMonitor(null, optsIE); prrIEstop.resolve()
  return stopMonitor(null, optsIE).then(r => prrIEstop.resolve(r));
}

function streamIssuerEffects () { // {{{1
  Promise.all([prrIEstart.promise, prrRIEon.promise]).then(_ => {
    out('streamIssuerEffects started')

    sdk = hXsdk({ out, vault })
    sdk.addStream(optsIE, "Issuer's effects",
      [
        ['account_credited', issuerEffect],
        ['account_debited', issuerEffect],
        ['claimable_balance_claimant_created', issuerEffect],
        ['claimable_balance_claimed', issuerEffect],
      ], 
      id,
      true // now
    )
    Promise.all([Demo.prrSetup.promise, IssuerSign.prrSetup.promise]).then(_ => {
      //console.log('streamIssuerEffects Demo', Demo, 'IssuerSign', IssuerSign)

      return Demo.prrStart.resolve(); // start demo
    });
  });
}

/* Preventing page reload {{{1
Thanks to Gemini:
*/
window.addEventListener('beforeunload', (event) => {
    // Triggers the browser's native confirmation dialog
    event.preventDefault();
    // Legacy support requirement for certain browsers
    event.returnValue = '';
});

