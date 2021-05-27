import { JSONPath } from 'jsonpath-plus';
import bigInt from 'big-integer';
import { TezosNodeReader } from 'conseiljs';

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

export const dexterPoolStorageMap = { coinBalancePath: '$.args[4].int', tokenBalancePath: '$.args[3].int', liquidityBalancePath: '$.args[1].args[2].int' };
export const quipuPoolStorageMap = {
    coinBalancePath: '$.args[1].args[0].args[1].args[2].int',
    tokenBalancePath: '$.args[1].args[0].args[2].args[1].int',
    liquidityBalancePath: '$.args[1].args[0].args[4].int',
};

export const tokenPoolMap = {
    KT19at7rQUvyjxnZ2fBv7D9zc8rkyG7gAoU8: { dexterPool: 'KT1PDrBE59Zmxnb8vXRgRAG1XmvTMTs5EDHU', quipuPool: 'KT1Evsp2yA19Whm24khvFPcwimK6UaAJu8Zo' }, // ethtz
    KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV: { dexterPool: 'KT1AbYeDbjjcAnV1QK7EZUUdqku77CdkTuv6', quipuPool: 'KT1K4EwTpbvYN9agJdjpyJm4ZZdhpUNKB3F6' }, // kusd
    KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn: { dexterPool: 'KT1BGQR7t4izzKZ7eRodKWTodAsM23P38v7N', quipuPool: 'KT1WBLrLE2vG8SedBqiSJFm4VVAZZBytJYHc' }, // tzbtc
    KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9: { dexterPool: 'KT1Tr2eG3eVmPRbymrbU2UppUmKjFPXomGG9', quipuPool: 'KT1WxgZ1ZSfMgmsSDDcUn8Xn577HwnQ7e1Lb' }, // usdtz
    KT1VYsVfmobT7rsMVivvZ4J8i3bPiqz12NaH: { dexterPool: 'KT1D56HQfMmwdopmFLTwNHFJSs6Dsg2didFo', quipuPool: 'KT1W3VGRUjvS869r4ror8kdaxqJAZUbPyjMT' }, // wxtz
};

/**
 * XTZ/Token exchange rate for a given XTZ trade.
 *
 * @param xtzAmount Proposed XTZ deposit
 * @param tokenBalance Current token balance in the pool
 * @param xtzBalance Current XTZ balance in the pool
 */
export function getTokenExchangeRate(xtzAmount: string, tokenBalance: string, xtzBalance: string, xtzDecimals: number = 6, exchangeMultiplier: number = 997) {
    const n = bigInt(xtzAmount).multiply(bigInt(tokenBalance)).multiply(bigInt(exchangeMultiplier));
    const d = bigInt(xtzBalance)
        .multiply(bigInt(1000))
        .add(bigInt(xtzAmount).multiply(bigInt(exchangeMultiplier))); // TODO: 1000

    const tokenAmount = n.divide(d);
    const dm = tokenAmount.divmod(bigInt(xtzAmount));
    const f = dm.remainder.multiply(bigInt(10 ** xtzDecimals)).divide(bigInt(xtzAmount));

    return { tokenAmount: tokenAmount.toString(), rate: parseFloat(`${dm.quotient.toJSNumber()}.${f.toJSNumber()}`) };
}

/**
 * Token/XTZ exchange rate for a given token trade.
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

export async function getPoolState(server: string, address: string, storageMap: PoolStorageMap): Promise<PoolState> {
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
