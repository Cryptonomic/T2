import { JSONPath } from 'jsonpath-plus';
import bigInt from 'big-integer';
import { BigNumber } from 'bignumber.js';

import { KeyStore, Signer, TezosNodeReader, TezosConstants, TezosNodeWriter, TezosParameterFormat, Transaction } from 'conseiljs';

import { knownTokenContracts } from '../../../constants/Token';
import { ArtToken, VaultToken, Token, TokenKind } from '../../../types/general';

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
export const granadaPoolStorageMap = { coinBalancePath: '$.args[1].int', tokenBalancePath: '$.args[0].int', liquidityBalancePath: '$.args[2].int' };
export const vortexPoolStorageMap = { coinBalancePath: '$.args[1].int', tokenBalancePath: '$.args[0].int', liquidityBalancePath: '$.args[2].int' };
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
const vortexExpirationPadding = 5 * 60 * 1000;

export const tokenPoolMap = {
    KT19at7rQUvyjxnZ2fBv7D9zc8rkyG7gAoU8: {
        dexterPool: 'KT1PDrBE59Zmxnb8vXRgRAG1XmvTMTs5EDHU',
        quipuPool: 'KT1Evsp2yA19Whm24khvFPcwimK6UaAJu8Zo',
        vortexPool: 'KT1V1ea4Rpb8AJJkmAtBpg1VRNyfLcFFZM6d',
    }, // ethtz
    KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV: {
        dexterPool: 'KT1AbYeDbjjcAnV1QK7EZUUdqku77CdkTuv6',
        quipuPool: 'KT1K4EwTpbvYN9agJdjpyJm4ZZdhpUNKB3F6',
        vortexPool: 'KT1Wjadao8AXkwNQmjstbPGtLd1ZrUyQEDX7',
    }, // kusd
    KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn: { granadaPool: 'KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5', quipuPool: 'KT1WBLrLE2vG8SedBqiSJFm4VVAZZBytJYHc' }, // tzbtc
    KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9: {
        dexterPool: 'KT1Tr2eG3eVmPRbymrbU2UppUmKjFPXomGG9',
        quipuPool: 'KT1WxgZ1ZSfMgmsSDDcUn8Xn577HwnQ7e1Lb',
        vortexPool: 'KT19HdcBJw8XJkDYKLr6ez9KkhhuS8MYUdcs',
    }, // usdtz
    KT1VYsVfmobT7rsMVivvZ4J8i3bPiqz12NaH: {
        dexterPool: 'KT1D56HQfMmwdopmFLTwNHFJSs6Dsg2didFo',
        quipuPool: 'KT1W3VGRUjvS869r4ror8kdaxqJAZUbPyjMT',
        vortexPool: 'KT1BcaTHMybrtH38pBtay32yaejyhdxDwyPX',
    }, // wxtz
    KT1AEfeckNbdEYwaMKkytBwPJPycz7jdSGea: { dexterPool: '', quipuPool: 'KT1BMEEPX7MWzwwadW3NCSZe9XGmFJ7rs7Dr' }, // stkr
    KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b: {
        dexterPool: '',
        quipuPool: 'KT1X1LgNkQShpF9nRLYw3Dgdy4qp38MX617z',
        vortexPool: 'KT1VSjJxNq98AkPfVktpCv82hacrvgkb6hEu',
    }, // plenty
    KT1A5P4ejnLix13jtadsfV9GCnXLMNnab8UT: {
        dexterPool: '',
        quipuPool: 'KT1J3wTYb4xk5BsSBkg6ML55bX1xq7desS34',
        vortexPool: 'KT1GLRpdAPdRp4gJZ7gTmvu1J9ULk3ckty7c',
    }, // kalam
    KT1G1cCRNBgQ48mVDjopHjEmTN5Sbtar8nn9: { dexterPool: '', quipuPool: 'KT1BgezWwHBxA9NrczwK9x3zfgFnUkc7JJ4b' }, // heh
    KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW: {
        dexterPool: '',
        quipuPool: 'KT1QxLqukyfohPV5kPkw97Rs6cw1DDDvYgbB',
        vortexPool: 'KT1GDzojMNFrk61JvAx9Po7f24ETuDnXtRo5',
    }, // hdao
    KT1REEb5VxWRjcHm5GzDMwErMmNFftsE5Gpf: { dexterPool: '', quipuPool: 'KT1KFszq8UFCcWxnXuhZPUyHT9FK3gjmSKm6' }, // usds
    KT1LRboPna9yQY9BrjtQYDS1DVxhKESK4VVd: {
        dexterPool: '',
        quipuPool: 'KT1FG63hhFtMEEEtmBSX2vuFmP87t9E7Ab4t',
        vortexPool: 'KT1CQP3kgsAFiFGLrjyqQqrx5s2kt3dQMyMx',
    }, // wrap
    KT1AxaBxkFLCUi3f8rdDAAxBKHfzY8LfKDRA: { dexterPool: '', quipuPool: 'KT1WtFb1mTsFRd1n1nAYMdrE2Ud9XREz5hjK' }, // QLkUSD
    KT1TwzD6zV3WeJ39ukuqxcfK2fJCnhvrdN1X: {
        dexterPool: '',
        quipuPool: 'KT1Gdix8LoDoQng7YqdPNhdP5V7JRX8FqWvM',
        vortexPool: 'KT1LzyPS8rN375tC31WPAVHaQ4HyBvTSLwBu',
    }, // SMAK
    KT1Wa8yqRBpFCusJWgcQyjhRz7hUQAmFxW7j: { dexterPool: '', quipuPool: 'KT1Q93ftAUzvfMGPwC78nX8eouL1VzmHPd4d' }, // FLAME
    KT1JkoE42rrMBP9b2oDhbx6EUr26GcySZMUH: { dexterPool: '', quipuPool: 'KT1NEa7CmaLaWgHNi6LkRi5Z1f4oHfdzRdGA' }, // kDAO
    'KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW+0': {
        dexterPool: '',
        quipuPool: 'KT1EtjRRCBC2exyCRXz8UfV7jz7svnkqi7di',
        vortexPool: 'KT1ND1bkLahTzVUt93zbDtGugpWcL23gyqgQ',
    }, // uUSD
    'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ+19': { dexterPool: '', quipuPool: 'KT1DksKXvCBJN7Mw6frGj6y6F3CbABWZVpj1' }, // wwBTC
    'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ+17': { dexterPool: '', quipuPool: 'KT1U2hs5eNdeCpHouAvQXGMzGFGJowbhjqmo' }, // wUSDC
    'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ+1': { dexterPool: '', quipuPool: 'KT1UMAE2PBskeQayP5f2ZbGiVYF7h8bZ2gyp' }, // wBUSD
    'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ+11': { dexterPool: '', quipuPool: 'KT1RsfuBee5o7GtYrdB7bzQ1M6oVgyBnxY4S' }, // wMATIC
    'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ+10': { dexterPool: '', quipuPool: 'KT1Lpysr4nzcFegC9ci9kjoqVidwoanEmJWt' }, // wLINK
    KT193D4vozYnhGJQVtw7CoxxqphqUEEwK6Vb: { dexterPool: '', quipuPool: 'KT1X3zxdTzPB9DgVzA3ad6dgZe9JEamoaeRy' }, // QUIPU
    KT1KPoyzkj82Sbnafm6pfesZKEhyCpXwQfMc: { dexterPool: '', quipuPool: 'KT1BweorZK1CJDEu76SyKcxfzeiAxip73Kot' }, // fDAO
    KT1Kyc366SrSJ1camxByr363F9WAiHAaReMv: { dexterPool: '', quipuPool: 'KT1EVNuwjj7GijvVaxR7Vd9mejy4V6toZkeK' }, // sexp
    'KT1T87QbpXEVgkwsNPzz8iRoah3SS3D1MDmh+0': {
        dexterPool: '',
        quipuPool: 'KT19g5hey69CiXRbhRzJEwvuJ95RgVLzS3TP',
    }, // tezdao
    KT1Ha4yFVeyzw6KRAdkzq6TxDHB97KG4pZe8: {
        dexterPool: '',
        quipuPool: '',
        vortexPool: 'KT1NoozaPXHKZHobxcheTWa1XLSTChUTgBg1',
    }, // doga
    KT1F1mn2jbqQCJcsNgYKVAQjvenecNMY2oPK: {
        dexterPool: '',
        quipuPool: 'KT1UJ1hVTdiUen7H3zk1CXGC7PbANb57VkS4',
    }, // pxl
};

export function isTradeable(tokenAddress: string, tokenIndex?: number) {
    if (tokenIndex !== undefined) {
        return Object.keys(tokenPoolMap).includes(`${tokenAddress}+${tokenIndex}`);
    }

    return Object.keys(tokenPoolMap).includes(tokenAddress);
}

/**
 *
 * @param amount Decimal-formatted XTZ amount
 * @param side buy | sell
 * @returns
 */
export function applyFees(amount: number, side: string, slippage: number = 0.01) {
    const fee = 0.05;
    const feeThreshold = '500000000';

    const ba = new BigNumber(amount);
    const bs = ba.multipliedBy(slippage);
    // const bf = ba.isGreaterThanOrEqualTo(feeThreshold) ? ba.multipliedBy(fee) : 0;
    const bf = 0;

    if (side === 'buy') {
        return ba.plus(bs).plus(bf).dp(0, 0).toNumber();
    }

    if (side === 'sell') {
        return ba.minus(bs).minus(bf).dp(0, 1).toNumber();
    }

    return 0;
}

export async function sendDexterBuy(
    tezosNode: string,
    keyStore: KeyStore,
    signer: Signer,
    tokenAddress: string,
    tokenIndex: number,
    poolAddress: string,
    notional: string,
    size: string
): Promise<string | undefined> {
    const expiration = new Date(Date.now() + dexterExpirationPadding);

    let buyParams: string;
    if (tokenAddress === 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn') {
        buyParams = `{"prim":"Pair","args":[{"string":"${keyStore.publicKeyHash}"},{"int":"${size}"},{"string":"${expiration.toISOString()}"}]}`;
    } else {
        buyParams = `{ "prim": "Pair", "args": [ { "string": "${
            keyStore.publicKeyHash
        }" }, { "prim": "Pair", "args": [ { "int": "${size}" }, { "string":"${expiration.toISOString()}" } ] } ] }`;
    }

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
            buyParams,
            TezosParameterFormat.Micheline,
            TezosConstants.HeadBranchOffset,
            true
        );

        return r.operationGroupID.replace(/\\|"|\n|\r/g, '');
    } catch (err) {
        console.log(`failed in sendDexterBuy ${JSON.stringify(err)}}`);
    }
}

export async function sendDexterSell(
    tezosNode: string,
    keyStore: KeyStore,
    signer: Signer,
    tokenAddress: string,
    tokenIndex: number,
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

    let sellParams: string;
    if (tokenAddress === 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn') {
        // TODO
        sellParams = `{"prim":"Pair","args":[{"string":"${
            keyStore.publicKeyHash
        }"},{"prim":"Pair","args":[{"int":"${size}"},{"prim":"Pair","args":[{"int":"${notional}"},{"string":"${expiration.toISOString()}"}]}]}]}`;
    } else {
        sellParams = `{ "prim": "Pair", "args": [ { "prim": "Pair", "args": [ { "string": "${keyStore.publicKeyHash}" }, { "string": "${
            keyStore.publicKeyHash
        }" } ] }, {"int": "${size}" }, { "int": "${notional}" }, { "string": "${expiration.toISOString()}" } ] }`;
    }

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
    }
}

export async function sendVortexBuy(
    tezosNode: string,
    keyStore: KeyStore,
    signer: Signer,
    tokenAddress: string,
    tokenIndex: number,
    poolAddress: string,
    notional: string,
    size: string
): Promise<string | undefined> {
    const expiration = new Date(Date.now() + vortexExpirationPadding);

    const buyParams = `{ "prim": "Pair", "args": [ { "string": "${
        keyStore.publicKeyHash
    }" }, { "int": "${size}" }, { "string":"${expiration.toISOString()}" } ] }`;

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
            buyParams,
            TezosParameterFormat.Micheline,
            TezosConstants.HeadBranchOffset,
            true
        );

        return r.operationGroupID.replace(/\\|"|\n|\r/g, '');
    } catch (err) {
        console.log(`failed in sendVortexBuy ${JSON.stringify(err)}}`);
    }
}

export async function sendVortexSell(
    tezosNode: string,
    keyStore: KeyStore,
    signer: Signer,
    tokenAddress: string,
    tokenIndex: number,
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

    const expiration = new Date(Date.now() + vortexExpirationPadding);

    const sellParams = `{ "prim": "Pair","args": [ { "string": "${
        keyStore.publicKeyHash
    }" }, { "int": "${size}" }, { "int": "${notional}" }, { "string": "${expiration.toISOString()}" } ] }`;

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
        console.log(`failed in sendVortexSell ${JSON.stringify(err)}}`);
    }
}

export async function sendQuipuBuy(
    tezosNode: string,
    keyStore: KeyStore,
    signer: Signer,
    tokenAddress: string,
    tokenIndex: number,
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
    }
}

export async function sendQuipuSell(
    tezosNode: string,
    keyStore: KeyStore,
    signer: Signer,
    tokenAddress: string,
    tokenIndex: number,
    poolAddress: string,
    notional: string,
    size: string
): Promise<string | undefined> {
    let selectedToken: Token | VaultToken | ArtToken;

    if (tokenIndex > -1) {
        selectedToken = knownTokenContracts.filter((t) => t.address === tokenAddress && t.tokenIndex === tokenIndex)[0];
    } else {
        selectedToken = knownTokenContracts.filter((t) => t.address === tokenAddress)[0];
    }

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
    }
}

export function getTokenToCashExchangeRate(
    tokenAmount: string,
    tokenBalance: string,
    cashBalance: string,
    tokenDecimals: number = 6,
    exchangeMultiplier: number = 997
) {
    const n = bigInt(tokenAmount).multiply(bigInt(cashBalance)).multiply(bigInt(exchangeMultiplier));
    const d = bigInt(tokenBalance)
        .multiply(bigInt(1000))
        .add(bigInt(tokenAmount).multiply(bigInt(exchangeMultiplier)));

    const cashAmount = n.divide(d);
    const dm = cashAmount.divmod(bigInt(tokenAmount));
    const f = dm.remainder.multiply(bigInt(10 ** tokenDecimals)).divide(bigInt(tokenAmount));

    return { cashAmount: cashAmount.toJSNumber(), rate: parseFloat(`${dm.quotient.toJSNumber()}.${f.toJSNumber()}`) };
}

export function getTokenToCashInverse(
    tokenAmount: string,
    tokenBalance: string,
    cashBalance: string,
    tokenDecimals: number = 6,
    exchangeMultiplier: number = 997
) {
    const n = bigInt(tokenAmount).multiply(bigInt(cashBalance)).multiply(bigInt(1000));
    const d = bigInt(tokenBalance)
        .multiply(bigInt(exchangeMultiplier))
        .subtract(bigInt(tokenAmount).multiply(bigInt(exchangeMultiplier)));

    const amount = n.divide(d);
    const rate = amount.divmod(bigInt(tokenAmount));
    const ff = rate.remainder.multiply(bigInt(10 ** tokenDecimals)).divide(bigInt(tokenAmount));

    return { cashAmount: amount.toJSNumber(), rate: parseFloat(`${rate.quotient.toJSNumber()}.${ff.toJSNumber()}`) };
}

export function calcTokenLiquidityRequirement(cashDeposit: string, tokenBalance: string, cashBalance: string): number {
    return bigInt(cashDeposit).multiply(tokenBalance).divide(cashBalance).toJSNumber();
}

export function calcCashLiquidityRequirement(tokenDeposit: string, tokenBalance: string, cashBalance: string): number {
    return bigInt(tokenDeposit).multiply(bigInt(cashBalance)).divide(bigInt(tokenBalance)).toJSNumber();
}

export function calcPoolShare(poolShare: string, partBalance: string, liquidityBalance: string): number {
    return bigInt(partBalance).multiply(poolShare).divide(liquidityBalance).toJSNumber();
}

export function calcProposedShare(cashDeposit: string, cashBalance: string, liquidityBalance: string): number {
    return bigInt(cashDeposit).multiply(liquidityBalance).divide(cashBalance).toJSNumber();
}

export async function getPoolState(server: string, address: string, storageMap: PoolStorageMap): Promise<PoolState | undefined> {
    if (!address || address.length === 0) {
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
