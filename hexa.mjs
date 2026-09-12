import { put, reset, } from './lib/util.mjs' // {{{1
import vault from './lib/vault.js'
import { Asset, Keypair, StrKey, } from '@stellar/stellar-sdk'
import { Channel, } from '../../lib/util.mjs'
import { hXsdk, } from './lib/sdk.mjs'

let color = 'blue'; const out = m => typeof m == 'string' ? put( // {{{1
  `<div style='text-align: right; color: ${color}'>${m}</div>`
) : put(m.message?.replaceAll('\n', '<br/>').replaceAll(' ', '&nbsp'))

reset({ // {{{1
  content: document.getElementById('content1'), handleCtrlC: handleCtrlC,
})
put(`Delivered ${location} on ${Date()} to YOUR_IP_ADDRESS`, '<hr/>')

window.process = { env: {
  Networks_PUBLIC: 'hX'
}}
let sdk = hXsdk({ out, vault })

document.getElementById('userSK').addEventListener('paste', (event) => {
  prepareAndSignStellarTx(event.clipboardData.getData('text'))
})

function prepareAndSignStellarTx (userSK) { // {{{1
  if (StrKey.isValidEd25519SecretSeed(userSK)) {
    put('You pasted valid secret key.')
  } else {
    throw ERROR('You pasted INVALID secret key.')
  }
  let userPK = Keypair.fromSecret(userSK).publicKey()
  let recipientKeys = [userSK, userPK]
  let issuer = { id: 'GC7BFT2ZXIQAU2GAYNODPVJV4OBFECV5L3NKO4RV5SHXFUR24M3BZNPY' }
  return sdk.server.server.loadAccount(userPK).then(recipient => {
    return sdk.transaction.changeTrust({ issuer, recipient, recipientKeys });
  }).then(tx => out(tx.created_at + ': DONE.'));
}

function handleCtrlC () { // {{{1
  out('handleCtrlC stub')
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

