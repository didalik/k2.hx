import { hXsdk, } from './sdk.mjs' // {{{1

let sdk, vault, accounts = {}; // {{{1

function Demo () { // {{{1
  return Promise.resolve('OK');
}

function DemoSign () { // {{{1
  return Promise.resolve('OK');
}

/** function DemoTmReset (opts = {}) { // {{{1
 * Resets Stellar TESTNET monitor. Accounts for Issuer, Bob, and Cyn are being set up.
 *
 * @param {object} opts.
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
      return Promise.resolve('OK');
    })
}

function DemoTmUse () { // {{{1
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

export { Demo, DemoSign, DemoTmReset, DemoTmUse, } // {{{1

