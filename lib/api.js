import { Asset, Claimant, Keypair, Memo, Operation, } from '@stellar/stellar-sdk' // {{{1

function chunkDescToOps (description, source = null) { // {{{1
  if (description.length < 1 || description.length > 2000) {
    throw `- chunkDescToOps: description.length is ${description.length}`
  }

  // Chunk description Operations into ops array
  let i = 0
  let ops = []
  while (description.length > 64) {
    let chunk = description.slice(0, 64)
    description = description.slice(64)

    if (source) {
      ops.push(
        Operation.manageData({ name: `data${i}`, value: chunk, source }),
        Operation.manageData({ name: `data${i}`, value: null, source })
      )
    } else {
      ops.push(
        Operation.manageData({ name: `data${i}`, value: chunk, }),
        Operation.manageData({ name: `data${i}`, value: null, })
      )
    }
    i++
  }
  if (description.length > 0) {
    if (source) {
      ops.push(
        Operation.manageData({ name: `data${i}`, value: description, source }),
        Operation.manageData({ name: `data${i}`, value: null, source })
      )
    } else {
      ops.push(
        Operation.manageData({ name: `data${i}`, value: description, }),
        Operation.manageData({ name: `data${i}`, value: null, })
      )
    }
  }

  return ops;
}

function makeRequest (opts) { // {{{1
  let { description, sdk, validity, } = opts
  let maker = opts.account
  let claimants = [ 
    new Claimant(opts.issuerKeys[1],
      validity == '0' ? Claimant.predicateUnconditional()
      : Claimant.predicateBeforeRelativeTime(validity)
    ),  
    new Claimant(maker.id, // maker can reclaim anytime
      Claimant.predicateUnconditional()
    )   
  ]
  let amount = parseHEXA(description)
  let kp = Keypair.fromSecret(opts.destKeys[0])
  return sdk.transaction.makeClaimableBalance.call(sdk, claimants, maker, kp, 
    new Asset(opts.asset, opts.issuerKeys[1]), amount,
    chunkDescToOps(description), Memo.text(`Request ${validity}`)
  ).then(r => { 
    r.request = description; r.amount = amount;
    opts.log('makeRequest r', r)
    return Promise.resolve(r);
  });
}

function parseHEXA (desc) { // string {{{1
  let index = desc ? desc.indexOf('HEXA ') : -1
  if (index < 0) {
    return null;
  }
  let words = desc.slice(index).split(' ')
  return words[1].endsWith('.') || words[1].endsWith(',') ?
    words[1].slice(0, words[1].length - 1)
  : words[1].trim();
}

export { makeRequest, } // {{{1
