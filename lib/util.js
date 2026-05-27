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

function setupActor (sdk, opts) { // {{{1
  let vault = opts.vault
  return sdk.server.loadAccount(opts).then(account => {
    opts.account = opts.recipient = account
    opts.destKeys = opts.recipientKeys = vault.get(opts.name+'.keys')
    if (vault.get(opts.name+'.change.trust') == 'DONE') {
      return Promise.resolve();
    }
    return sdk.transaction.changeTrust(opts).
      then(_ => vault.put(opts.name+'.change.trust', 'DONE'));
  }).then(_ => {
    if (vault.get(opts.name+'.fund.HEXA') == 'DONE') {
      return Promise.resolve();
    }
    return sdk.transaction.fund(opts).
      then(_ => vault.put(opts.name+'.fund.HEXA', 'DONE'));
  }).then(_ => {
    opts.log('-', opts.name, 'has HEXA', sdk.balance(opts.account, 'HEXA'))
    return Promise.resolve();
  });
}

function stopMonitor (r, opts) { // {{{1
  for (let stream of opts.streams) {
    stream.close()
    console.log(`stopMonitor - "${stream.tag}" closed.`)
  }
  return Promise.resolve(r);
}

export { Context, destFund, setupActor, stopMonitor, } // {{{1

