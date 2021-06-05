import { JSONPath } from 'jsonpath-plus';
import bigInt from 'big-integer';

import { KeyStore, Signer, TezosNodeReader, TezosConstants, TezosNodeWriter, TezosParameterFormat } from 'conseiljs';

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

const dexterExpirationPadding = 5 * 60 * 1000;

export const tokenPoolMap = {
    KT19at7rQUvyjxnZ2fBv7D9zc8rkyG7gAoU8: { dexterPool: 'KT1PDrBE59Zmxnb8vXRgRAG1XmvTMTs5EDHU', quipuPool: 'KT1Evsp2yA19Whm24khvFPcwimK6UaAJu8Zo' }, // ethtz
    KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV: { dexterPool: 'KT1AbYeDbjjcAnV1QK7EZUUdqku77CdkTuv6', quipuPool: 'KT1K4EwTpbvYN9agJdjpyJm4ZZdhpUNKB3F6' }, // kusd
    KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn: { dexterPool: 'KT1BGQR7t4izzKZ7eRodKWTodAsM23P38v7N', quipuPool: 'KT1WBLrLE2vG8SedBqiSJFm4VVAZZBytJYHc' }, // tzbtc
    KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9: { dexterPool: 'KT1Tr2eG3eVmPRbymrbU2UppUmKjFPXomGG9', quipuPool: 'KT1WxgZ1ZSfMgmsSDDcUn8Xn577HwnQ7e1Lb' }, // usdtz
    KT1VYsVfmobT7rsMVivvZ4J8i3bPiqz12NaH: { dexterPool: 'KT1D56HQfMmwdopmFLTwNHFJSs6Dsg2didFo', quipuPool: 'KT1W3VGRUjvS869r4ror8kdaxqJAZUbPyjMT' }, // wxtz
    KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b: { dexterPool: '', quipuPool: 'KT1X1LgNkQShpF9nRLYw3Dgdy4qp38MX617z' }, // plenty
};

export async function sendDexterBuy(
    tezosNode: string,
    keyStore: KeyStore,
    signer: Signer,
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
    poolAddress: string,
    notional: string,
    size: string
): Promise<string | undefined> {
    const expiration = new Date(Date.now() + dexterExpirationPadding);
    const params = `{ "prim": "Pair","args": [ { "prim": "Pair", "args": [ { "string": "${keyStore.publicKeyHash}" }, { "string": "${
        keyStore.publicKeyHash
    }" } ] }, {"int": "${size}" }, { "int": "${notional}" }, { "string": "${expiration.toISOString()}" } ] }`;

    try {
        // TODO: missing approval operation

        const r = await TezosNodeWriter.sendContractInvocationOperation(
            tezosNode,
            signer,
            keyStore,
            poolAddress,
            Number(notional),
            0,
            0,
            0,
            'tokenToXtz',
            params,
            TezosParameterFormat.Micheline,
            TezosConstants.HeadBranchOffset,
            true
        );

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
    poolAddress: string,
    notional: string,
    size: string
): Promise<string | undefined> {
    const params = `{ "prim": "Pair", "args": [ { "prim": "Pair", "args": [ { "int": "${size}" }, { "int": "${notional}" } ] }, { "string": "${keyStore.publicKeyHash}" } ] }`;

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
            'tokenToTezPayment',
            params,
            TezosParameterFormat.Micheline,
            TezosConstants.HeadBranchOffset,
            true
        );

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

export async function constructApprovalOperation(
    sourceAddress: string,
    counter: number,
    signer: Signer,
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