function Context (stateInitial, tag = null) { // {{{1
// see https://en.wikipedia.org/wiki/State_pattern
////
  this.state = stateInitial
  this.tag = tag
  //console.log('new Context tag', tag)
 
}

function destFund (sdk, opts) { // {{{1
  return sdk.server.server.loadAccount(opts.destKeys[1]). // load the dest account
    then(account => {
      opts.account = account
      return sdk.transaction.fund(opts);                  // fund the dest account
    });
}

function issuerClaimant (effect) { // {{{1
  //this.log('issuerClaimant this.context', this.context)

  this.context.state.handle.call(this, effect)
}

function stopMonitor (r, opts) { // {{{1
  for (let stream of opts.streams) {
    stream.close()
    console.log(`stopMonitor - "${stream.tag}" closed.`)
  }
  return Promise.resolve(r);
}

export { Context, destFund, issuerClaimant, stopMonitor, } // {{{1

