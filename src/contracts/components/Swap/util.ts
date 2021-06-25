import { JSONPath } from 'jsonpath-plus';
import bigInt from 'big-integer';

import { KeyStore, Signer, TezosNodeReader, TezosConstants, TezosNodeWriter, TezosParameterFormat, Transaction } from 'conseiljs';

import { knownTokenContracts } from '../../../constants/Token';
import { TokenKind } from '../../../types/general';

export interface PoolState {
    coinBalance: string;
    tokenBalance: string;
    liquidityBalance: string;
}

export interface PoolStorageMap {
    coinBalancePath: string;
    tokenBalancePath: string;
    liquidityBalancePath: string;
}

export interface OperationFee {
    fee: number;
    gas: number;
    storage: number;
}

export const dexterPoolStorageMap = { coinBalancePath: '$.args[4].int', tokenBalancePath: '$.args[3].int', liquidityBalancePath: '$.args[1].args[2].int' };
export const quipuPoolStorageMap = {
    coinBalancePath: '$.args[1].args[0].args[1].args[2].int',
    tokenBalancePath: '$.args[1].args[0].args[2].args[1].int',
    liquidityBalancePath: '$.args[1].args[0].args[4].int',
};

export const quipuPool2StorageMap = {
    coinBalancePath: '$.args[1].args[0].args[1].args[2].int',
    tokenBalancePath: '$.args[1].args[0].args[3].int',
    liquidityBalancePath: '$.args[1].args[1].args[0].args[0].int',
};

const dexterExpirationPadding = 5 * 60 * 1000;

export const tokenPoolMap = {
    KT19at7rQUvyjxnZ2fBv7D9zc8rkyG7gAoU8: { dexterPool: 'KT1PDrBE59Zmxnb8vXRgRAG1XmvTMTs5EDHU', quipuPool: 'KT1Evsp2yA19Whm24khvFPcwimK6UaAJu8Zo' }, // ethtz
    KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV: { dexterPool: 'KT1AbYeDbjjcAnV1QK7EZUUdqku77CdkTuv6', quipuPool: 'KT1K4EwTpbvYN9agJdjpyJm4ZZdhpUNKB3F6' }, // kusd
    KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn: { dexterPool: 'KT1BGQR7t4izzKZ7eRodKWTodAsM23P38v7N', quipuPool: 'KT1WBLrLE2vG8SedBqiSJFm4VVAZZBytJYHc' }, // tzbtc
    KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9: { dexterPool: 'KT1Tr2eG3eVmPRbymrbU2UppUmKjFPXomGG9', quipuPool: 'KT1WxgZ1ZSfMgmsSDDcUn8Xn577HwnQ7e1Lb' }, // usdtz
    KT1VYsVfmobT7rsMVivvZ4J8i3bPiqz12NaH: { dexterPool: 'KT1D56HQfMmwdopmFLTwNHFJSs6Dsg2didFo', quipuPool: 'KT1W3VGRUjvS869r4ror8kdaxqJAZUbPyjMT' }, // wxtz
    KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b: { dexterPool: '', quipuPool: 'KT1X1LgNkQShpF9nRLYw3Dgdy4qp38MX617z' }, // plenty
    KT1A5P4ejnLix13jtadsfV9GCnXLMNnab8UT: { dexterPool: '', quipuPool: 'KT1J3wTYb4xk5BsSBkg6ML55bX1xq7desS34' }, // kalam
    KT1G1cCRNBgQ48mVDjopHjEmTN5Sbtar8nn9: { dexterPool: '', quipuPool: 'KT1BgezWwHBxA9NrczwK9x3zfgFnUkc7JJ4b' }, // heh
    KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW: { dexterPool: '', quipuPool: 'KT1QxLqukyfohPV5kPkw97Rs6cw1DDDvYgbB' }, // hdao
    KT1REEb5VxWRjcHm5GzDMwErMmNFftsE5Gpf: { dexterPool: '', quipuPool: 'KT1KFszq8UFCcWxnXuhZPUyHT9FK3gjmSKm6' }, // usds
    KT1LRboPna9yQY9BrjtQYDS1DVxhKESK4VVd: { dexterPool: '', quipuPool: 'KT1FG63hhFtMEEEtmBSX2vuFmP87t9E7Ab4t' }, // wrap
    KT1AxaBxkFLCUi3f8rdDAAxBKHfzY8LfKDRA: { dexterPool: '', quipuPool: 'KT1WtFb1mTsFRd1n1nAYMdrE2Ud9XREz5hjK' }, // QLkUSD
};

export function isTradeable(tokenAddress: string) {
    return Object.keys(tokenPoolMap).includes(tokenAddress);
}

/**
 *
 * @param amount Decimal-formatted XTZ amount
 * @param side buy | sell
 * @returns
 */
export function applyFees(amount: number, side: string) {
    return amount;
    // const slippage = 0.01;
    // const fee = 0.05;
    // const feeThreshold = 500_000_000;

    // const ba = new BigNumber(amount);
    // const bs = ba.multipliedBy(slippage);
    // const bf = ba.isGreaterThanOrEqualTo(feeThreshold) ? ba.multipliedBy(fee) : 0;

    // if (side === 'buy') {
    //     return ba.plus(bs).plus(bf).dp(0, 0).toNumber();
    // }

    // if (side === 'sell') {
    //     return ba.minus(bs).minus(bf).dp(0, 1).toNumber();
    // }

    // return 0;
}

export async function sendDexterBuy(
    tezosNode: string,
    keyStore: KeyStore,
    signer: Signer,
    tokenAddress: string,
    poolAddress: string,
    notional: string,
    size: string
): Promise<string | undefined> {
    const expiration = new Date(Date.now() + dexterExpirationPadding);
    const params = `{ "prim": "Pair", "args": [ { "string": "${
        keyStore.publicKeyHash
    }" }, { "prim": "Pair", "args": [ { "int": "${size}" }, { "string":"${expiration.toISOString()}" } ] } ] }`;

    try {
        const r = await TezosNodeWriter.sendContractInvocationOperation(
            tezosNode,
            signer,
            keyStore,
            poolAddress,
            Number(notional),
            0,
            0,
            0,
            'xtzToToken',
            params,
            TezosParameterFormat.Micheline,
            TezosConstants.HeadBranchOffset,
            true
        );

        return r.operationGroupID.replace(/\\|"|\n|\r/g, '');
    } catch (err) {
        console.log(`failed in sendDexterBuy ${JSON.stringify(err)}}`);
        return undefined;
    }
}

export async function sendDexterSell(
    tezosNode: string,
    keyStore: KeyStore,
    signer: Signer,
    tokenAddress: string,
    poolAddress: string,
    notional: string,
    size: string
): Promise<string | undefined> {
    const nextCounter = (await TezosNodeReader.getCounterForAccount(tezosNode, keyStore.publicKeyHash)) + 1;

    const approveParams = `{ "prim": "Pair", "args": [ { "string": "${poolAddress}" }, { "int": "${size}" } ] }`;
    const approveOp = TezosNodeWriter.constructContractInvocationOperation(
        keyStore.publicKeyHash,
        nextCounter,
        tokenAddress,
        0,
        0,
        0,
        0,
        'approve',
        approveParams
    );

    const expiration = new Date(Date.now() + dexterExpirationPadding);
    const sellParams = `{ "prim": "Pair","args": [ { "prim": "Pair", "args": [ { "string": "${keyStore.publicKeyHash}" }, { "string": "${
        keyStore.publicKeyHash
    }" } ] }, {"int": "${size}" }, { "int": "${notional}" }, { "string": "${expiration.toISOString()}" } ] }`;
    const sellOp = TezosNodeWriter.constructContractInvocationOperation(
        keyStore.publicKeyHash,
        nextCounter + 1,
        poolAddress,
        0,
        0,
        0,
        0,
        'tokenToXtz',
        sellParams
    );

    try {
        const opGroup = await TezosNodeWriter.prepareOperationGroup(tezosNode, keyStore, nextCounter - 1, [approveOp, sellOp], true);
        const r = await TezosNodeWriter.sendOperation(tezosNode, opGroup, signer);

        return r.operationGroupID.replace(/\\|"|\n|\r/g, '');
    } catch (err) {
        console.log(`failed in sendDexterSell ${JSON.stringify(err)}}`);
        return undefined;
    }
}

export async function sendQuipuBuy(
    tezosNode: string,
    keyStore: KeyStore,
    signer: Signer,
    tokenAddress: string,
    poolAddress: string,
    notional: string,
    size: string
): Promise<string | undefined> {
    const params = `{ "prim": "Pair","args": [ { "int": "${size}" }, { "string": "${keyStore.publicKeyHash}" } ] }`;

    try {
        const r = await TezosNodeWriter.sendContractInvocationOperation(
            tezosNode,
            signer,
            keyStore,
            poolAddress,
            Number(notional),
            0,
            0,
            0,
            'tezToTokenPayment',
            params,
            TezosParameterFormat.Micheline,
            TezosConstants.HeadBranchOffset,
            true
        );

        return r.operationGroupID.replace(/\\|"|\n|\r/g, '');
    } catch (err) {
        console.log(`failed in sendQuipuBuy ${JSON.stringify(err)}}`);
        return undefined;
    }
}

export async function sendQuipuSell(
    tezosNode: string,
    keyStore: KeyStore,
    signer: Signer,
    tokenAddress: string,
    poolAddress: string,
    notional: string,
    size: string
): Promise<string | undefined> {
    const selectedToken = knownTokenContracts.filter((t) => t.address === tokenAddress)[0];

    const nextCounter = (await TezosNodeReader.getCounterForAccount(tezosNode, keyStore.publicKeyHash)) + 1;

    let approveOp: Transaction;
    if (selectedToken.kind === TokenKind.tzip12 || selectedToken.kind === TokenKind.objkt) {
        approveOp = constructFA2ApprovalOperation(
            keyStore.publicKeyHash,
            nextCounter,
            { fee: 0, gas: 0, storage: 0 },
            tokenAddress,
            poolAddress,
            selectedToken.tokenIndex?.toString() || '0'
        );
    } else {
        approveOp = constructFA1ApprovalOperation(keyStore.publicKeyHash, nextCounter, { fee: 0, gas: 0, storage: 0 }, tokenAddress, poolAddress, size);
    }

    const sellParams = `{ "prim": "Pair", "args": [ { "prim": "Pair", "args": [ { "int": "${size}" }, { "int": "${notional}" } ] }, { "string": "${keyStore.publicKeyHash}" } ] }`;
    const sellOp = TezosNodeWriter.constructContractInvocationOperation(
        keyStore.publicKeyHash,
        nextCounter + 1,
        poolAddress,
        0,
        0,
        0,
        0,
        'tokenToTezPayment',
        sellParams
    );

    try {
        const opGroup = await TezosNodeWriter.prepareOperationGroup(tezosNode, keyStore, nextCounter - 1, [approveOp, sellOp], true);
        const r = await TezosNodeWriter.sendOperation(tezosNode, opGroup, signer);

        return r.operationGroupID.replace(/\\|"|\n|\r/g, '');
    } catch (err) {
        console.log(`failed in sendQuipuSell ${JSON.stringify(err)}}`);
        return undefined;
    }
}

/**
 * Token/XTZ exchange rate for a given token sale.
 *
 * @param tokenAmount Proposed token deposit
 * @param tokenBalance Current token balance in the pool
 * @param xtzBalance Current XTZ balance in the pool
 */
export function getXTZSellExchangeRate(
    tokenAmount: string,
    tokenBalance: string,
    xtzBalance: string,
    tokenDecimals: number = 6,
    exchangeMultiplier: number = 997
) {
    const n = bigInt(tokenAmount).multiply(bigInt(xtzBalance)).multiply(bigInt(exchangeMultiplier));
    const d = bigInt(tokenBalance)
        .multiply(bigInt(1000))
        .add(bigInt(tokenAmount).multiply(bigInt(exchangeMultiplier)));

    const amount = n.divide(d);
    const rate = amount.divmod(bigInt(tokenAmount));
    const ff = rate.remainder.multiply(bigInt(10 ** tokenDecimals)).divide(bigInt(tokenAmount));

    return {
        xtzAmount: amount.toJSNumber(),
        rate: parseFloat(`${rate.quotient.toJSNumber()}.${ff.toJSNumber()}`),
    };
}

export function getXTZBuyExchangeRate(
    tokenAmount: string,
    tokenBalance: string,
    xtzBalance: string,
    tokenDecimals: number = 6,
    exchangeMultiplier: number = 997
) {
    const n = bigInt(tokenAmount).multiply(bigInt(xtzBalance)).multiply(bigInt(1000));
    const d = bigInt(tokenBalance)
        .multiply(bigInt(exchangeMultiplier))
        .subtract(bigInt(tokenAmount).multiply(bigInt(exchangeMultiplier)));

    const amount = n.divide(d);
    const rate = amount.divmod(bigInt(tokenAmount));
    const ff = rate.remainder.multiply(bigInt(10 ** tokenDecimals)).divide(bigInt(tokenAmount));

    return {
        xtzAmount: amount.toJSNumber(),
        rate: parseFloat(`${rate.quotient.toJSNumber()}.${ff.toJSNumber()}`),
    };
}

export async function getPoolState(server: string, address: string, storageMap: PoolStorageMap): Promise<PoolState | undefined> {
    if (address.length === 0) {
        return undefined;
    }
    const storageResult = await TezosNodeReader.getContractStorage(server, address);

    const tokenBalance = JSONPath({ path: storageMap.tokenBalancePath, json: storageResult })[0];
    const xtzBalance = JSONPath({ path: storageMap.coinBalancePath, json: storageResult })[0];
    const liquidityBalance = JSONPath({ path: storageMap.liquidityBalancePath, json: storageResult })[0];

    return {
        coinBalance: xtzBalance,
        tokenBalance,
        liquidityBalance,
    };
}

export function constructFA1ApprovalOperation(
    sourceAddress: string,
    counter: number,
    fee: OperationFee,
    tokenAddress: string,
    destinationAddress: string,
    amount: string = '0'
) {
    const params = `{ "prim": "Pair", "args": [ { "string": "${destinationAddress}" }, { "int": "${amount}" } ] }`;

    return TezosNodeWriter.constructContractInvocationOperation(
        sourceAddress,
        counter,
        tokenAddress,
        0,
        fee?.fee || 0,
        fee?.storage || 0,
        fee?.gas || 0,
        'approve',
        params
    );
}

export function constructFA2ApprovalOperation(
    sourceAddress: string,
    counter: number,
    fee: OperationFee,
    tokenAddress: string,
    destinationAddress: string,
    tokenIndex: string = '0'
) {
    const params = `[{"prim":"Left","args":[{"prim":"Pair","args":[{"string":"${sourceAddress}"},{"prim":"Pair","args":[{"string":"${destinationAddress}"},{"int":"${tokenIndex}"}]}]}]}]`;

    return TezosNodeWriter.constructContractInvocationOperation(
        sourceAddress,
        counter,
        tokenAddress,
        0,
        fee?.fee || 0,
        fee?.storage || 0,
        fee?.gas || 0,
        'update_operators',
        params
    );
}
