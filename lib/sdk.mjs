// API is for users; SDK is for devs. This is hX SDK, still public. {{{1
import {
  Asset, Keypair, Horizon, MemoHash, MemoText, Networks, TransactionBuilder,
} from '@stellar/stellar-sdk'

/** function resetAssetIssuer (opts) {{{1
 * For given opts.asset, reset its issuer, then opts.cb.call(this, issuer).
 *
 * @param {object} opts.
 * @returns {array} keysIssuer in the form [SK, PK].
 */
function resetAssetIssuer (opts) {
}

export { resetAssetIssuer }
