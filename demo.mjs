import { put, reset, } from './lib/util.mjs' // {{{1
import { connection, promiseWithResolvers, } from '../../lib/util.mjs'
import { JWT, Job, generate_keypair, verifyPayload, } from '../../jf/lib/util.mjs'

const out = m => typeof m == 'string' ? put( // {{{1
  `<div style='text-align: right'><b>${m}</b></div>`
) : (console.log(m.message), put(m.message))

const Demo = { // {{{1
  Running: { // {{{2
    handle: (context, event) => {
      /*
      console.log(
        'Demo.Running.handle context', context,
        'name', context.attachment.iss.name,
        'aud', Demo.aud
      )
      */
      if (!event) {
        return;
      }
      verifyPayload(event.message).then(payload => {
        //out({ message: `- ${payload.iss.name}:` })
        out({ message: payload.sub })
      })
    },
  },
  aud: 'demo', // {{{2

  onclose: data => { // {{{2
    let context = Demo.job.context
    console.log(
      'data', data, 'name', context.attachment.iss.name, 'aud', Demo.aud
    )
    Demo.job.resolve(`- ${context.attachment.iss.name}: Demo DONE`)
  },
  onerror: null, // is never called {{{2
  
  onmessage:  data => { // {{{2
    let context = Demo.job.context
    /*
    console.log(
      'data', data, 'name', context.attachment.iss.name, 'aud', Demo.aud
    )
    */
    context.state.handle(context, data)
  }, // }}}2
}

const DemoReset = { // {{{1
  Running: { // {{{2
    handle: (context, event) => {
      /*
      console.log(
        'DemoReset.Running.handle context', context,
        'name', context.attachment.iss.name,
        'aud', DemoReset.aud
      )
      */
      if (!event) {
        return;
      }
      verifyPayload(event.message).then(payload => {
        //out({ message: `- ${payload.iss.name}:` })
        out({ message: payload.sub })
      })
    },
  },
  aud: 'demo/reset', // {{{2

  onclose: data => { // {{{2
    let context = DemoReset.job.context
    console.log(
      'data', data, 'name', context.attachment.iss.name, 'aud', DemoReset.aud
    )
    DemoReset.job.resolve(`- ${context.attachment.iss.name}: DemoReset DONE`)
  },
  onerror: null, // is never called {{{2
  
  onmessage:  data => { // {{{2
    let context = DemoReset.job.context
    /*
    console.log(
      'data', data, 'name', context.attachment.iss.name, 'aud', DemoReset.aud
    )
    */
    context.state.handle(context, data)
  }, // }}}2
}

const DemoSetup = { // {{{1
  Running: { // {{{2
    handle: (context, event) => {
      /*
      console.log(
        'DemoSetup.Running.handle context', context,
        'name', context.attachment.iss.name,
        'aud', DemoSetup.aud
      )
      */
      if (!event) {
        return;
      }
      verifyPayload(event.message).then(payload => {
        //out({ message: `- ${payload.iss.name}:` })
        out({ message: payload.sub })
      })
    },
  },
  aud: 'demo/setup', // {{{2

  onclose: data => { // {{{2
    let context = DemoSetup.job.context
    console.log(
      'data', data, 'name', context.attachment.iss.name, 'aud', DemoSetup.aud
    )
    DemoSetup.job.resolve(`- ${context.attachment.iss.name}: DemoSetup DONE`)
  },
  onerror: null, // is never called {{{2
  
  onmessage:  data => { // {{{2
    let context = DemoSetup.job.context
    /*
    console.log(
      'data', data, 'name', context.attachment.iss.name, 'aud', DemoSetup.aud
    )
    */
    context.state.handle(context, data)
  }, // }}}2
}

const DemoSign = { // {{{1
  Running: { // {{{2
    handle: (context, event) => {
      /*
      console.log(
        'DemoSign.Running.handle context', context,
        'name', context.attachment.iss.name,
        'aud', DemoSign.aud
      )
      */
      if (!event) {
        return;
      }
      verifyPayload(event.message).then(payload => {
        //out({ message: `- ${payload.iss.name}:` })
        out({ message: payload.sub })
      })
    },
  },
  aud: 'demo/sign', // {{{2

  onclose: data => { // {{{2
    let context = DemoSign.job.context
    console.log(
      'data', data, 'name', context.attachment.iss.name, 'aud', DemoSign.aud
    )
    DemoSetup.job.resolve(`- ${context.attachment.iss.name}: DemoSetup DONE`)
  },
  onerror: null, // is never called {{{2
  
  onmessage:  data => { // {{{2
    let context = DemoSign.job.context
    /*
    console.log(
      'data', data, 'name', context.attachment.iss.name, 'aud', DemoSign.aud
    )
    */
    context.state.handle(context, data)
  }, // }}}2
}

const wsArgs = [location.toString().replace('http', 'ws')] // {{{1

reset({ content: document.getElementById('content1'), }) // {{{1
put(`Delivered ${location} on ${Date()} to YOUR_IP_ADDRESS`, '<hr/>')
  
let client, step = DemoReset // {{{1
generate_keypair.call(crypto.subtle).then(keys => {
  const [sk, pk] = keys.split(' ')
  const app = 'hX', iss = { name: 'Ann', pk, uuid: 'UUID', }
  return (step.job = Job(client = { app, iss, sk, wsArgs, WebSocket, }, step)).promise;
}).then(result => {
  out(result)
  step = DemoSetup
  return (step.job = Job(client, step)).promise;
}).then(result => {
  out(result)
  out('- Ann: mocking Demo job')
  return mockDemo(client).promise;
}).then(result => {
  out(result)
})

function mockDemo (client) { // {{{1
  let result = promiseWithResolvers()
  Demo.job = Job(client, Demo)
  DemoSign.job = Job(client, DemoSign)
  setTimeout(mockDemoStop, 8000, client, Demo, result)
  return result;
}

function mockDemoStop (actor, opts, result) { // {{{1
  let stop = 'context.job.stdin.end()'
  new JWT(stop).setIssuer(actor.iss, actor.sk).setAudience(opts.aud).sign().
    then(jwt => opts.job.context.ws.send(jwt))
  opts === Demo && mockDemoStop(actor, DemoSign, result)
    || result.resolve('- Ann: mockDemo DONE')
}

