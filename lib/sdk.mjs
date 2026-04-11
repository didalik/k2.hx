// API is for users; SDK is for devs. This is hX SDK, still public. {{{1
import {
  Asset, Keypair, Horizon, MemoHash, MemoText, Networks, TransactionBuilder,
} from '@stellar/stellar-sdk'

/** function hXsdk (opts = null) { // {{{1
 * This function returns an object that supports KNOWN properties. You can access a KNOWN
 * property even if it does not yet exist in such an object - if the property is KNOWN to
 * this function, it is being added to the object.
 *
 * @param {object} opts.
 * @todo Use opts.
 * @returns proxy to an object with KNOWN properties.
 */
function hXsdk (opts = null) {
  let networkPassphrase = Networks.TESTNET
  if (process?.env?.Networks_PUBLIC) {
    if (process.env.Networks_PUBLIC == 'hX') {
      networkPassphrase = Networks.PUBLIC
    } else {
      throw Error(`Invalid process.env.Networks_PUBLIC ${process.env.Networks_PUBLIC}`)
    }
  }
  return { networkPassphrase };
}

export { hXsdk, } // {{{1

