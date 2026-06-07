import { // {{{1
  Asset, BASE_FEE, Claimant, Keypair, Memo, MemoHash, MemoReturn, MemoText,
  Networks,
  Operation,
  TransactionBuilder, xdr,
} from '@stellar/stellar-sdk'

const HEX_KEY = '0.0000100', HEX_DISPUTE = '0.0000099' // {{{1

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

function description (operations) { // {{{1
  let result = ''
  for (let o of operations.records) {
    if (o.type == 'manage_data' && o.value.length > 0) {
      result += Buffer.from(o.value, 'base64').toString()
    } 
  }
  return result;
}

function effectDesc (effect) { // {{{1
  if (
    effect?.type == 'claimable_balance_claimant_created' ||
    effect?.type == 'claimable_balance_claimed' ||
    effect?.type == 'account_credited' ||
    effect?.type == 'account_debited'
  ) {
    let tx, { amount, balance_id } = effect
    return effect.operation().then(op => op.transaction()).
      then(t => (tx = t).operations()).then(ops => Promise.resolve({
        amount, balance_id,
        txDesc: description(ops),
        txId: tx.id,
        txMemo: memo2str(tx),
        txMemoType: tx.memo_type,
        txSrc: tx.source_account,
      }));
  }
  console.trace()

  return Promise.resolve({
    message: 'effectDesc effect UNEXPECTED', effect
  });
}

function makeOffer (opts) { // {{{1
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
  let amount = HEX_KEY
  let kp = Keypair.fromSecret(opts.destKeys[0])
  return sdk.transaction.makeClaimableBalance.call(sdk, claimants, maker, kp, 
    new Asset(opts.asset, opts.issuerKeys[1]), amount,
    chunkDescToOps(description), Memo.text(`Offer ${validity}`)
  ).then(r => { 
    r.request = description; r.amount = amount;
    opts.log('makeOffer r', r)
    return Promise.resolve(r);
  });
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

function memo2str (tx) { // {{{1
  if (tx.memo_type == MemoHash || tx.memo_type == MemoReturn) {
    return Buffer.from(tx.memo, 'base64').toString('hex');
  }
  if (tx.memo_type == MemoText) {
    return tx.memo.toString();
  }
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

function takeOffer (opts) { // {{{1
  let { amount, makeTxId, sdk, validity, } = opts
  let taker = opts.account
  let claimants = [ 
    new Claimant(opts.issuerKeys[1],
      validity == '0' ? Claimant.predicateUnconditional()
      : Claimant.predicateBeforeRelativeTime(validity)
    ),  
    new Claimant(taker.id, // taker can reclaim anytime
      Claimant.predicateUnconditional()
    )   
  ]
  let kp = Keypair.fromSecret(opts.destKeys[0])
  return sdk.transaction.makeClaimableBalance.call(sdk, claimants, taker, kp, 
    new Asset(opts.asset, opts.issuerKeys[1]), amount,
    [], Memo.hash(makeTxId)
  ).then(r => { 
    r.amount = amount;
    opts.log('takeOffer r', r)
    return Promise.resolve(r);
  });
}

function takeRequest (opts) { // {{{1
  let { makeTxId, sdk, validity, } = opts
  let taker = opts.account
  let claimants = [ 
    new Claimant(opts.issuerKeys[1],
      validity == '0' ? Claimant.predicateUnconditional()
      : Claimant.predicateBeforeRelativeTime(validity)
    ),  
    new Claimant(taker.id, // taker can reclaim anytime
      Claimant.predicateUnconditional()
    )   
  ]
  let amount = HEX_KEY
  let kp = Keypair.fromSecret(opts.destKeys[0])
  return sdk.transaction.makeClaimableBalance.call(sdk, claimants, taker, kp, 
    new Asset(opts.asset, opts.issuerKeys[1]), amount,
    [], Memo.hash(makeTxId)
  ).then(r => { 
    r.amount = amount;
    opts.log('takeRequest r', r)
    return Promise.resolve(r);
  });
}

function txDesc (tx) { // {{{1
  //console.log('txDesc tx', tx)

  if (
    tx?.memo_type == 'return'
  ) {
    let txId = tx.id
    tx = TransactionBuilder.fromXDR(tx.envelope_xdr, Networks.TESTNET) // FIXME
    let ops = tx._operations
    let op = ops.find(op => op.type == 'payment' && op.asset.code == 'ClawableHexa')
    return {
      amount: op.amount,
      destination: op.destination,
      txId,
    };
  }
  console.trace()

  return { message: 'txDesc tx UNEXPECTED', tx };
}

export { // {{{1
  HEX_KEY,
  effectDesc, makeOffer, makeRequest, parseHEXA, takeOffer, takeRequest, txDesc,
} 

