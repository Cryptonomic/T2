import {
    ConseilQueryBuilder,
    ConseilOperator,
    ConseilSortDirection,
    TezosConseilClient,
    TezosMessageUtils,
    TezosNodeReader,
    TezosNodeWriter,
    TezosConstants,
    TezosContractUtils,
    TezosParameterFormat,
    Signer,
    KeyStore,
} from 'conseiljs';
import { BigNumber } from 'bignumber.js';
import { JSONPath } from 'jsonpath-plus';

import * as status from '../../constants/StatusTypes';
import { Node, TokenKind } from '../../types/general';
import { createTokenTransaction, syncTransactionsWithState } from '../../utils/transaction';
import { knownTokenContracts, knownContractNames } from '../../constants/Token';

export async function syncTokenTransactions(tokenAddress: string, managerAddress: string, node: Node, stateTransactions: any[], tokenKind: TokenKind) {
    let newTransactions: any[] = (
        await getTokenTransactions(tokenAddress, managerAddress, node).catch((e) => {
            console.log('-debug: Error in: getSyncAccount -> getTransactions for:' + tokenAddress);
            console.error(e);
            return [];
        })
    ).filter((obj, pos, arr) => arr.map((o) => o.operation_group_hash).indexOf(obj.operation_group_hash) === pos);

    const addressPattern = '([1-9A-Za-z^OIl]{36})';
    const bytesPattern = '([0-9a-f]+)';
    const amountPattern = '([0-9]+)';

    const transferAddressPattern = new RegExp(`[{] Pair "${addressPattern}" [{] Pair "${addressPattern}" [(]Pair [0-9]+ ${amountPattern}[)] [}] [}]`);
    const transferBytesPattern = new RegExp(`[{] Pair 0x${bytesPattern} [{] Pair 0x${bytesPattern} [(]Pair [0-9]+ ${amountPattern}[)] [}] [}]`);
    const mintPattern = new RegExp(`Right[(]Right[(]Right[(]Left[(]Pair"${addressPattern}"${amountPattern}[))))]`);
    const burnPattern = new RegExp(`Right[(]Right[(]Right[(]Right[(]Pair"${addressPattern}"${amountPattern}[))))]`);
    const pausePatternFalse = new RegExp('Right[(]Left[(]LeftFalse[))]');
    const pausePatternTrue = new RegExp('Right[(]Left[(]LeftTrue[))]');

    newTransactions = newTransactions.map((transaction) => {
        const params = transaction.parameters;

        if (transaction.parameters_entrypoints === 'approve') {
            const michelineParams = JSON.parse(transaction.parameters_micheline);

            const targetAddress = JSONPath({ path: '$.args[0].string', json: michelineParams })[0];
            const targetScale = knownTokenContracts.filter((t) => t.address === tokenAddress)[0].scale || 0;
            const targetAmount = new BigNumber(JSONPath({ path: '$.args[1].int', json: michelineParams })[0]).dividedBy(10 ** targetScale).toNumber();

            return createTokenTransaction({
                ...transaction,
                status: transaction.status !== 'applied' ? status.FAILED : status.READY,
                amount: targetAmount,
                source: knownContractNames[tokenAddress] || tokenAddress,
                destination: targetAddress,
                entryPoint: 'approve',
            });
        } else if (transferAddressPattern.test(params) || transferBytesPattern.test(params)) {
            try {
                let parts: any[] = [];
                let amount = 0;
                let source = '';
                let destination = '';

                if (transferAddressPattern.test(params)) {
                    parts = params.match(transferAddressPattern);
                    amount = Number(parts[3]);
                    source = parts[1];
                    destination = parts[2];
                } else if (transferBytesPattern.test(params)) {
                    parts = params.match(transferBytesPattern);
                    amount = Number(parts[3]);
                    source = TezosMessageUtils.readAddress(parts[1]);
                    destination = TezosMessageUtils.readAddress(parts[2]);
                }

                return createTokenTransaction({
                    ...transaction,
                    status: transaction.status !== 'applied' ? status.FAILED : status.READY,
                    amount,
                    source,
                    destination,
                });
            } catch (e) {
                /* */
            }
        } else if (mintPattern.test(params)) {
            try {
                const parts = params.match(mintPattern);
                return createTokenTransaction({
                    ...transaction,
                    status: transaction.status !== 'applied' ? status.FAILED : status.READY,
                    amount: Number(parts[2]),
                    source: managerAddress,
                    destination: parts[1],
                    entryPoint: 'mint',
                });
            } catch (e) {
                /* */
            }
        } else if (burnPattern.test(params)) {
            try {
                const parts = params.match(burnPattern);

                return createTokenTransaction({
                    ...transaction,
                    status: transaction.status !== 'applied' ? status.FAILED : status.READY,
                    amount: Number(parts[2]) * -1,
                    source: managerAddress,
                    destination: parts[1],
                    entryPoint: 'burn',
                });
            } catch (e) {
                /* */
            }
        } else if (pausePatternFalse.test(params) || pausePatternTrue.test(params)) {
            const parts = params.match(burnPattern);
            return createTokenTransaction({
                ...transaction,
                status: transaction.status !== 'applied' ? status.FAILED : status.READY,
                source: managerAddress,
                destination: tokenAddress,
                entryPoint: 'setPause',
            });
        } else {
            console.warn(`cannot render unsupported transaction: "${params}" from ${JSON.stringify(transaction)}`);
        }
    });

    return syncTransactionsWithState(newTransactions, stateTransactions);
}

export async function getTokenTransactions(tokenAddress: string, managerAddress: string, node: Node) {
    const { conseilUrl, apiKey, network } = node;

    let direct = ConseilQueryBuilder.blankQuery();
    direct = ConseilQueryBuilder.addFields(
        direct,
        'timestamp',
        'block_level',
        'source',
        'destination',
        'amount',
        'kind',
        'fee',
        'status',
        'operation_group_hash',
        'parameters',
        'parameters_micheline',
        'parameters_entrypoints'
    );
    direct = ConseilQueryBuilder.addPredicate(direct, 'kind', ConseilOperator.EQ, ['transaction'], false);
    direct = ConseilQueryBuilder.addPredicate(direct, 'status', ConseilOperator.EQ, ['applied'], false);
    direct = ConseilQueryBuilder.addPredicate(direct, 'destination', ConseilOperator.EQ, [tokenAddress], false);
    direct = ConseilQueryBuilder.addPredicate(direct, 'source', ConseilOperator.EQ, [managerAddress], false);
    direct = ConseilQueryBuilder.addOrdering(direct, 'timestamp', ConseilSortDirection.DESC);
    direct = ConseilQueryBuilder.setLimit(direct, 1_000);

    let indirect = ConseilQueryBuilder.blankQuery();
    indirect = ConseilQueryBuilder.addFields(
        indirect,
        'timestamp',
        'block_level',
        'source',
        'destination',
        'amount',
        'kind',
        'fee',
        'status',
        'operation_group_hash',
        'parameters',
        'parameters_micheline',
        'parameters_entrypoints'
    );
    indirect = ConseilQueryBuilder.addPredicate(indirect, 'kind', ConseilOperator.EQ, ['transaction'], false);
    indirect = ConseilQueryBuilder.addPredicate(indirect, 'status', ConseilOperator.EQ, ['applied'], false);
    indirect = ConseilQueryBuilder.addPredicate(indirect, 'destination', ConseilOperator.EQ, [tokenAddress], false);
    indirect = ConseilQueryBuilder.addPredicate(indirect, 'parameters', ConseilOperator.LIKE, [managerAddress], false);
    indirect = ConseilQueryBuilder.addOrdering(indirect, 'timestamp', ConseilSortDirection.DESC);
    indirect = ConseilQueryBuilder.setLimit(indirect, 1_000);

    return Promise.all([direct, indirect].map((q) => TezosConseilClient.getOperations({ url: conseilUrl, apiKey, network }, network, q)))
        .then((responses) =>
            responses.reduce((result, r) => {
                r.forEach((rr) => result.push(rr));
                return result;
            })
        )
        .then((transactions) => {
            return transactions.sort((a, b) => a.timestamp - b.timestamp);
        });
}

/**
 * Parses storage of contracts matching the youves FA2 implementation in smartpy.
 */
export async function getSimpleStorageYV(tezosUrl: string, tokenAddress: string, accountAddress?: string) {
    const storageResult = await TezosNodeReader.getContractStorage(tezosUrl, tokenAddress);

    const packedKey = TezosMessageUtils.encodeBigMapKey(
        Buffer.from(
            TezosMessageUtils.writePackedData(
                `
    { "prim": "Pair", "args": [ { "bytes": "${TezosMessageUtils.writeAddress(accountAddress || '')}" }, { "int": "0" } ] }`,
                ''
            ),
            'hex'
        )
    );
    const mapResult = await TezosNodeReader.getValueForBigMapKey(tezosUrl, 16593, packedKey);
    let administrator = '';
    if (mapResult !== undefined) {
        administrator = accountAddress || '';
    }

    return {
        administrator,
        tokens: -1,
        ledger: Number(JSONPath({ path: '$.args[0].args[1].int', json: storageResult })[0]),
        metadata: Number(JSONPath({ path: '$.args[0].args[2].int', json: storageResult })[0]),
        paused: false, // TODO
        operators: Number(JSONPath({ path: '$.args[1].args[0].int', json: storageResult })[0]),
        tokenMetadata: Number(JSONPath({ path: '$.args[2].int', json: storageResult })[0]),
    };
}

export async function mintYV(
    server: string,
    address: string,
    signer: Signer,
    keystore: KeyStore,
    fee: number,
    destination: string,
    amount: number,
    tokenIndex: number = 0
): Promise<string> {
    const params = `{ "prim": "Pair", "args": [ {"bytes": "${TezosMessageUtils.writeAddress(
        destination
    )}"}, { "prim": "Pair", "args": [ { "int": "${tokenIndex}" }, { "int": "${amount}" } ] } ] }`;

    const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(
        server,
        signer,
        keystore,
        address,
        0,
        fee,
        0,
        0,
        'mint',
        params,
        TezosParameterFormat.Micheline,
        TezosConstants.HeadBranchOffset,
        true
    );

    return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
}

export async function burnYV(
    server: string,
    address: string,
    signer: Signer,
    keystore: KeyStore,
    fee: number,
    destination: string,
    amount: number,
    tokenIndex: number = 0
): Promise<string> {
    const params = `{ "prim": "Pair", "args": [ { "bytes": "${TezosMessageUtils.writeAddress(
        destination
    )}" }, { "prim": "Pair", "args": [ { "int": "${tokenIndex}" }, { "int": "${amount}" } ] } ] }`;

    const r = await TezosNodeWriter.sendContractInvocationOperation(
        server,
        signer,
        keystore,
        address,
        0,
        fee,
        0,
        0,
        'burn',
        params,
        TezosParameterFormat.Micheline,
        TezosConstants.HeadBranchOffset,
        true
    );

    return TezosContractUtils.clearRPCOperationGroupHash(r.operationGroupID);
}
