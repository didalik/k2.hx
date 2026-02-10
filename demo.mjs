/*import { // {{{1
  Context, // TODO get rid of it
  JobRequest, 
  configuration, // TODO get rid of it
  demo_onmessage, confirmingHandle, matchingHandle,
} from '../local/lib/util.mjs' */
import { put, reset, } from './lib/util.mjs' // {{{1
import { connection, promiseWithResolvers, } from '../../lib/util.mjs'
import { Job, generate_keypair, verifyPayload, } from '../../jf/lib/util.mjs'

const out = m => typeof m == 'string' ? put( // {{{1
  `<h4 style='text-align: right'>${m}</h4>`
) : put(m.message)

const text2echo = `Lorem ipsum dolor sit amet, consectetur adipiscing elit,<br/>
sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad<br/>
minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea<br/>
commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit<br/>
esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat<br/>
non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.<br/>
`

const DemoReset = { // {{{1
  Running: {
    handle: null,
  },
  aud: 'demo/reset',
  onclose: data => console.log(
    'data', data, 'name', DemoReset.job.context.attachment.iss.name,
    'aud', DemoReset.aud
  ),
  onerror: null, // is never called
  onmessage:  data => {
    let context = DemoReset.job.context
    console.log(
      'data', data, 'name', context.attachment.iss.name, 'aud', DemoReset.aud
    )
    context.state.handle(context, data)
  },
}

/*const State = { // {{{1
  MATCHING: 1,
  Running: { // {{{2 
    handle: (context, event) => {
      console.log(configuration.me, 'Running context', context)
      try {
        if (event) {
          verifyPayload(event.message).then(payload => {
            console.log('payload', payload)
            out({ message: `- ${payload.iss.name}:` })
            out({ message: payload.sub })
          });
        } else {
          new JWT(text2echo).
            setIssuer(context.attachment.iss, context.attachment.sk).sign().
            then(t => {
              context.ws.send(t)
              out(`- ${configuration.me}:`)
              out(text2echo)
            })
        }
      } catch(err) { throw Error('UNEXPECTED err', err) }
    }
  }, // }}}2
}*/
const wsArgs = [location.toString().replace('http', 'ws')] // {{{1

reset({ content: document.getElementById('content1'), }) // {{{1
put(`Delivered ${location} on ${Date()} to YOUR_IP_ADDRESS`, '<hr/>')
  
let client, step = DemoReset // {{{1
generate_keypair.call(crypto.subtle).then(keys => {
  const [sk, pk] = keys.split(' ')
  const app = 'hX', iss = { name: 'Ann', pk, uuid: 'UUID', }
  return (step.job = Job(client = { app, iss, sk, wsArgs, WebSocket, }, step)).promise;
}).then(jr => {
  /*Object.assign(configuration, promiseWithResolvers())
  sendJobRequest(jr).     // part 1
    then(_ => { // {{{2
      Object.assign(configuration, promiseWithResolvers())
      configuration.attachment.state = State.MATCHING
      delete configuration.attachment.match
      delete configuration.attachment.matchConfirming
      sendJobRequest(jr). // part 2
        then(_ => console.log('sendJobRequest DONE'))
    }) // }}}2
    */
})

/*function sendJobRequest (jr, count = 2) { // {{{1
  let context
  const ws = connection(new WebSocket(wsURL)).
    on('error', console.error).
    on('message', mobj => demo_onmessage(ws, mobj, context)).
    on('close', data => {
      console.log(configuration.me, 'close data', data)
      put("<h3 style='text-align: center'>Test PASSED</h3>")
      if (--count > 0) {
        configuration.attachment.state = State.MATCHING
        delete configuration.attachment.match
        delete configuration.attachment.matchConfirming
        sendJobRequest(jr, count)
      } else {
        configuration.resolve()
      }
    }).send(jr)
  context = Context(ws, configuration.attachment)
  return configuration.promise;
}*/
