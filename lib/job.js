import { hXsdk, } from './sdk.mjs' // {{{1

let sdk, vault, accounts = {}; // {{{1

function Demo () { // {{{1
  return Promise.resolve('OK');
}

function DemoSign () { // {{{1
  return Promise.resolve('OK');
}

/** function DemoTmReset (opts) { // {{{1
 * Resets Stellar TESTNET monitor:
 * - sets up accounts for Issuer, Bob, and Cyn.
 *
 * See also {@link https://www.youtube.com/watch?v=y4TELgx28D4|this YouTube video}.
 *
 * @param {object} opts:
 * - vault.
 *
 * @returns {Promise<string>} promise that resolves to a string.
 */
function DemoTmReset (opts = {}) {
  if (!opts.vault) throw Error('opts.vault missing')
  vault = opts.vault
  return (sdk = hXsdk({ vault })).server.loadAccount({ name: 'Issuer' }).
    then(account => {
      accounts.issuer = account
      accounts.issuerKeys = vault.get('Issuer.keys')
      return addAccount('Bob');
    }).
    then(account => {
      accounts.bob = account
      accounts.bobKeys = vault.get('Bob.keys')
      return addAccount('Cyn');
    }).
    then(account => {
      accounts.cyn = account
      accounts.cynKeys = vault.get('Cyn.keys')
      if (vault.get('accounts.setup') === 'DONE') {
        return Promise.resolve('OK');
      }
      return setupAccounts();
    });
}

function DemoTmUse (opts) { // {{{1
  startMonitor(opts)
  return opts.promise;
}

function DemoTmUseRequest (opts) { // {{{1
  return Promise.resolve('OK');
}

function addAccount (name) { // {{{1
  delete sdk.server.opts4loadAccount.account
  sdk.server.opts4loadAccount.name = name
  if (sdk.transaction?.opts4createAccount?.defaults?.opts) {
    sdk.transaction.opts4createAccount.defaults.opts = {}
  }
  return sdk.server.loadAccount(sdk.server.opts4loadAccount);
}

function setupAccounts () { // {{{1
  const opts = {
    issuer: accounts.issuer, 
    recipient: accounts.bob,
    recipientKeys: accounts.bobKeys,
  }
  return sdk.transaction.changeTrust(opts).then(_ => {
    opts.recipient = accounts.cyn
    opts.recipientKeys = accounts.cynKeys
    return sdk.transaction.changeTrust(opts);
  }).then(_ => {
    Object.assign(opts, {
      issuerKeys: accounts.issuerKeys,
      agentKeys: accounts.bobKeys,
      asset: 'MA',
      amount: '1000',
      clawback: false,
    })
    return sdk.transaction.fund(opts);
  }).then(_ => {
    opts.agentKeys = accounts.cynKeys
    return sdk.transaction.fund(opts);
  }).then(_ => (vault.put('accounts.setup', 'DONE'), Promise.resolve('OK')));
}

function startMonitor (opts) { // {{{1
  console.log('startMonitor opts', opts)

}

export { Demo, DemoSign, DemoTmReset, DemoTmUse, DemoTmUseRequest, } // {{{1

