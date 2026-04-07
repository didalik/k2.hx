import { // {{{1
  Channel, connection, promiseWithResolvers,
} from '../../../lib/util.mjs'
import {
  JWT, Job, generate_keypair, verifyPayload, }
from '../../../jf/lib/util.mjs'
//import { View, } from './mvc.mjs'

let out // {{{1

const Demo = { // {{{1
  Running: { // {{{2
    handle: (context, event) => {
      if (!event) {
        return Demo.channel.receive().then(s =>
          new JWT(s).setIssuer(Demo.client.iss, Demo.client.sk).
          setAudience(Demo.aud).sign()
        ).then(jwt => Demo.job.context.ws.send(jwt));
      }
      verifyPayload(event.message).then(payload => {
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
      console.log('DemoSign.Running.handle context', context, 'event', event)

      if (!event) {
        return DemoSign.channel.receive().then(s =>
          new JWT(s).setIssuer(DemoSign.client.iss, DemoSign.client.sk).
          setAudience(DemoSign.aud).sign()
        ).then(jwt => {
          DemoSign.job.context.ws.send(jwt)
          DemoSign.Running.handle() // outbound data
        });
      }
      verifyPayload(event.message).then(payload => {
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
    DemoSign.job.resolve(`- ${context.attachment.iss.name}: DemoSign DONE`)
  },
  onerror: null, // is never called {{{2
  
  onmessage:  data => { // {{{2
    DemoSign.job.context.state.handle(DemoSign.job.context, data)
  }, // }}}2
}

const wsArgs = [location.toString().replace('http', 'ws')] // {{{1

function runDemo (client) { // {{{1
  toggleDivs()
  let position = { lat: LATITUDE, lng: LONGITUDE }
  //let view = new View(position)
  //console.log('runDemo position', position, 'view', view)

  let result = promiseWithResolvers()
  Object.assign(Demo, { channel: new Channel() }, { client }, 
    { job: Job(client, Demo) }
  )
  Object.assign(DemoSign, { channel: new Channel() }, { client }, 
    { job: Job(client, DemoSign) }
  )
  DemoSign.channel.send("Ann's sign request 1<br/>")
  DemoSign.channel.send("Ann's sign request 2<br/>")
  DemoSign.channel.send("Ann's sign request 3<br/>")

  setTimeout(runDemoStop, 3000, client, Demo, result)
  return result;
}

function runDemoStop (actor, opts, result) { // {{{1
  let stop = 'context.job.stdin.end()'
  opts.channel.send(stop)
  opts === Demo && runDemoStop(actor, DemoSign, result)
    || result.resolve('- Ann: runDemo DONE')
}

function startDemo (_out) { // {{{1
  let params = new URLSearchParams(location.search)
  let secret = params.get('secret')
  console.log('startDemo secret', secret, 'seller', params.get('seller'))
  out = _out
  let client, step = DemoReset
  generate_keypair.call(crypto.subtle).then(keys => { // DemoReset {{{2
    const [sk, pk] = keys.split(' ')
    const app = 'hX', iss = { name: 'Ann', pk, secret, uuid: 'UUID', }
    client = { app, iss, sk, wsArgs, WebSocket, }
    return (step.job = Job(client, step)).promise;
  }).then(result => { // DemoSetup {{{2
    out(result)
    step = DemoSetup
    return (step.job = Job(client, step)).promise;
  }).then(result => { // Demo {{{2
    out(result)
    out('- Ann: running Demo job')
    return runDemo(client).promise;
  }).then(result => { // teardown {{{2
    out(result)
    setTimeout(toggleDivs, 2000)
  }) // }}}2
}

function toggleDivs () { // {{{1
  let div1 = document.getElementById('div1')
  let div2 = document.getElementById('div2')
  if (div2.style.display == 'none') {
    div2.style.display = 'block'
    div1.style.display = 'none'
  } else {
    div1.style.display = 'block'
    div2.style.display = 'none'
  }
  console.log('toggleDivs div1.style.display', div1.style.display, 'div2.style.display', div2.style.display)
}

export { startDemo, toggleDivs, } // {{{1

