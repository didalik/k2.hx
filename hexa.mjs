import { put, reset, } from './lib/util.mjs' // {{{1
import vault from './lib/vault.js'
import { issuerEffect, setupActor, stopMonitor, } from './lib/util.js'
import demouser from './src/demoit/demouser.js'
import { Asset, StrKey, } from '@stellar/stellar-sdk'
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
const name = params.get('demouser') ?? crypto.randomUUID()
window.process = { env: {
  Networks_PUBLIC: null, // or 'hX' to use public network
}}

let audience = ['demo', 'issuer/sign'] // {{{1

reset({ // {{{1
  content: document.getElementById('content1'), handleCtrlC: stopIssuerSign,
})
put(`Delivered ${location} on ${Date()} to YOUR_IP_ADDRESS`, '<hr/>')

document.getElementById('userSK').addEventListener('paste', (event) => {
  prepareAndSignStellarTx(event.clipboardData.getData('text'))
})

function prepareAndSignStellarTx (userSK) { // {{{1
  if (StrKey.isValidEd25519SecretSeed(userSK)) {
    put('You pasted valid secret key.')
  }
}

function stopIssuerSign () { // {{{1
  out('stopIssuerSign: stopping job IssuerSign...')
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

