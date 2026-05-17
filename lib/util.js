function Context (stateInitial) { // {{{1
// see https://en.wikipedia.org/wiki/State_pattern
////
  this.state = stateInitial
}

function destFund (sdk, opts) { // {{{1
  return sdk.server.server.loadAccount(opts.destKeys[1]). // load the dest account
    then(account => {
      opts.account = account
      return sdk.transaction.fund(opts);                  // fund the dest account
    });
}

function issuerClaimant (effect) { // {{{1
  this.context.state.handle.call(this, effect)
}

export { Context, destFund, issuerClaimant, } // {{{1

