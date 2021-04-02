import {
    ConseilQueryBuilder,
    ConseilOperator,
    ConseilSortDirection,
    TezosConseilClient,
    TezosMessageUtils,
    TezosNodeReader,
    TezosParameterFormat,
} from 'conseiljs';
import { BigNumber } from 'bignumber.js';
import { JSONPath } from 'jsonpath-plus';

import * as status from '../../constants/StatusTypes';
import { Node, Token, TokenKind } from '../../types/general';
import { createTokenTransaction, syncTransactionsWithState } from '../../utils/transaction';
import { knownTokenContracts, knownContractNames } from '../../constants/Token';

export async function syncTokenTransactions(node: Node, token: Token, managerAddress: string, stateTransactions: any[]) {
    /*let newTransactions: any[] = (
        await getTokenTransactions(tokenAddress, managerAddress, node).catch((e) => {
            console.log('-debug: Error in: getSyncAccount -> getTransactions for:' + tokenAddress);
            console.error(e);
            return [];
        })
    ).filter((obj, pos, arr) => arr.map((o) => o.operation_group_hash).indexOf(obj.operation_group_hash) === pos);

    const addressPattern = '([1-9A-Za-z^OIl]{36})';
    const amountPattern = '([0-9]+)';

    const transferPattern = new RegExp(`Left[(]Left[(]Left[(]Pair"${addressPattern}"[(]Pair"${addressPattern}"([0-9]+)[))))]`);
    const transferShortPattern = new RegExp(`Pair"${addressPattern}"[(]Pair"${addressPattern}"([0-9]+)[)]`);
    const mintPattern = new RegExp(`Right[(]Right[(]Right[(]Left[(]Pair"${addressPattern}"${amountPattern}[))))]`);
    const burnPattern = new RegExp(`Right[(]Right[(]Right[(]Right[(]Pair"${addressPattern}"${amountPattern}[))))]`);
    const pausePatternFalse = new RegExp('Right[(]Left[(]LeftFalse[))]');
    const pausePatternTrue = new RegExp('Right[(]Left[(]LeftTrue[))]');

    newTransactions = newTransactions.map((transaction) => {
        const params = transaction.parameters.replace(/\s/g, '');

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
        } else if (transferPattern.test(params) || transferShortPattern.test(params)) {
            try {
                let parts: any[] = [];

                if (transferPattern.test(params)) {
                    parts = params.match(transferPattern);
                } else if (transferShortPattern.test(params)) {
                    parts = params.match(transferShortPattern);
                }

                return createTokenTransaction({
                    ...transaction,
                    status: transaction.status !== 'applied' ? status.FAILED : status.READY,
                    amount: Number(parts[3]),
                    source: parts[1],
                    destination: parts[2],
                });
            } catch (e) {
                //
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
                //
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
                //
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
            console.warn(`cannot render unsupported transaction: "${params}" from ${transaction}`);
        }
    });

    return syncTransactionsWithState(newTransactions, stateTransactions);*/
}

export async function getTokenTransactions(tokenAddress, managerAddress, node: Node) {
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
    direct = ConseilQueryBuilder.setLimit(direct, 5_000);

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
    indirect = ConseilQueryBuilder.setLimit(indirect, 5_000);

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

/*export async function getCreations(tokenMapId: number, managerAddress: string, node: Node): Promise<any[]> {
    const { conseilUrl, apiKey, network } = node;

    let collectionQuery = ConseilQueryBuilder.blankQuery();
    collectionQuery = ConseilQueryBuilder.addFields(collectionQuery, 'key', 'value');
    collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'big_map_id', ConseilOperator.EQ, [tokenMapId]);
    collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'key', ConseilOperator.STARTSWITH, [
        `Pair 0x${TezosMessageUtils.writeAddress(managerAddress)}`,
    ]);
    collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'value', ConseilOperator.EQ, [0], true);
    collectionQuery = ConseilQueryBuilder.setLimit(collectionQuery, 10_000);

    const collectionResult = await TezosConseilClient.getTezosEntityData({ url: conseilUrl, apiKey, network }, network, 'big_map_contents', collectionQuery);

    const collection = collectionResult.map((i) => {
        return { piece: i.key.toString().replace(/.* ([0-9]{1,}$)/, '$1'), amount: Number(i.value) };
    });

    return collection;
}*/

function makeLastPriceQuery(operations) {
    let lastPriceQuery = ConseilQueryBuilder.blankQuery();
    lastPriceQuery = ConseilQueryBuilder.addFields(lastPriceQuery, 'timestamp', 'amount', 'operation_group_hash', 'parameters_entrypoints', 'parameters');
    lastPriceQuery = ConseilQueryBuilder.addPredicate(lastPriceQuery, 'kind', ConseilOperator.EQ, ['transaction']);
    lastPriceQuery = ConseilQueryBuilder.addPredicate(lastPriceQuery, 'status', ConseilOperator.EQ, ['applied']);
    lastPriceQuery = ConseilQueryBuilder.addPredicate(lastPriceQuery, 'internal', ConseilOperator.EQ, ['false']);
    lastPriceQuery = ConseilQueryBuilder.addPredicate(
        lastPriceQuery,
        'operation_group_hash',
        operations.length > 1 ? ConseilOperator.IN : ConseilOperator.EQ,
        operations
    );
    lastPriceQuery = ConseilQueryBuilder.setLimit(lastPriceQuery, operations.length);

    return lastPriceQuery;
}

export async function getCollection(tokenMapId: number, managerAddress: string, node: Node): Promise<any[]> {
    const { conseilUrl, apiKey, network } = node;

    let collectionQuery = ConseilQueryBuilder.blankQuery();
    collectionQuery = ConseilQueryBuilder.addFields(collectionQuery, 'key', 'value', 'operation_group_id');
    collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'big_map_id', ConseilOperator.EQ, [tokenMapId]);
    collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'key', ConseilOperator.STARTSWITH, [
        `Pair 0x${TezosMessageUtils.writeAddress(managerAddress)}`,
    ]);
    collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'value', ConseilOperator.EQ, [0], true);
    collectionQuery = ConseilQueryBuilder.setLimit(collectionQuery, 10_000);

    const collectionResult = await TezosConseilClient.getTezosEntityData({ url: conseilUrl, apiKey, network }, network, 'big_map_contents', collectionQuery);

    const operationGroupIds = collectionResult.map((r) => r.operation_group_id);
    const queryChunks = chunkArray(operationGroupIds, 30);
    const priceQueries = queryChunks.map((c) => makeLastPriceQuery(c));

    const priceMap: any = {};
    await Promise.all(
        priceQueries.map(
            async (q) =>
                await TezosConseilClient.getTezosEntityData({ url: conseilUrl, apiKey, network }, network, 'operations', q).then((result) =>
                    result.map((row) => {
                        let amount = 0;
                        const action = row.parameters_entrypoints;

                        if (action === 'collect') {
                            amount = Number(row.parameters.toString().replace(/^Pair ([0-9]+) [0-9]+/, '$1'));
                        } else if (action === 'transfer') {
                            amount = Number(
                                row.parameters
                                    .toString()
                                    .replace(
                                        /[{] Pair \"[1-9A-HJ-NP-Za-km-z]{36}\" [{] Pair \"[1-9A-HJ-NP-Za-km-z]{36}\" [(]Pair [0-9]+ [0-9]+[)] [}] [}]/,
                                        '$1'
                                    )
                            );
                        }

                        priceMap[row.operation_group_hash] = {
                            price: new BigNumber(row.amount),
                            amount,
                            timestamp: row.timestamp,
                            action,
                        };
                    })
                )
        )
    );

    const collection = collectionResult.map((row) => {
        let price = 0;
        let receivedOn = new Date();
        let action = '';

        try {
            const priceRecord = priceMap[row.operation_group_id];
            price = priceRecord.price.dividedToIntegerBy(priceRecord.amount).toNumber();
            receivedOn = new Date(priceRecord.timestamp);
            action = priceRecord.action === 'collect' ? 'Purchased' : 'Received';
        } catch {
            //
        }

        return {
            piece: row.key.toString().replace(/.* ([0-9]{1,}$)/, '$1'),
            amount: Number(row.value),
            price: isNaN(price) ? 0 : price,
            receivedOn,
            action,
        };
    });

    return collection.sort((a, b) => b.receivedOn.getTime() - a.receivedOn.getTime());
}

export async function getCollectionSize(tokenMapId: number, managerAddress: string, node: Node): Promise<number> {
    const collection = await getCollection(tokenMapId, managerAddress, node);
    const tokenCount = collection.reduce((a, c) => a + c.amount, 0);

    return tokenCount;
}

/**
 * Returns raw hDAO token balance for the account.
 * KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW, ledger map id 515
 *
 * @param tokenMapId
 * @param managerAddress
 * @param node
 * @returns
 */
export async function getBalance(tezosUrl: string, mapId: number, address: string): Promise<number> {
    const packedTokenKey = TezosMessageUtils.encodeBigMapKey(
        Buffer.from(TezosMessageUtils.writePackedData(`(Pair 0x${TezosMessageUtils.writeAddress(address)} 0)`, '', TezosParameterFormat.Michelson), 'hex')
    );
    let balance = 0;

    try {
        const balanceResult = await TezosNodeReader.getValueForBigMapKey(tezosUrl, mapId, packedTokenKey);
        balance = new BigNumber(JSONPath({ path: '$.int', json: balanceResult })[0]).toNumber();
    } catch (err) {
        //
    }

    return balance;
}

/**
 *
 *
 */
export async function getTokenInfo(node: Node, mapId: number = 515): Promise<{ holders: number; totalBalance: number }> {
    const { conseilUrl, apiKey, network } = node;

    let holdersQuery = ConseilQueryBuilder.blankQuery();
    holdersQuery = ConseilQueryBuilder.addFields(holdersQuery, 'value');
    holdersQuery = ConseilQueryBuilder.addPredicate(holdersQuery, 'big_map_id', ConseilOperator.EQ, [mapId]);
    holdersQuery = ConseilQueryBuilder.setLimit(holdersQuery, 20_000);

    const holdersResult = await TezosConseilClient.getTezosEntityData({ url: conseilUrl, apiKey, network }, network, 'big_map_contents', holdersQuery);

    let holders = 0;
    let totalBalance = new BigNumber(0);
    holdersResult.forEach((r) => {
        try {
            const balance = new BigNumber(r.value);
            if (balance.isGreaterThan(0)) {
                totalBalance = totalBalance.plus(balance);
            }
            holders++;
        } catch {
            // eh
        }
    });

    console.log('HIC getTokenInfo', holders, totalBalance.toString());

    return { holders, totalBalance: totalBalance.toNumber() };
}

export async function getNFTObjectDetails(tezosUrl: string, objectId: number) {
    const packedNftId = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(objectId, 'int'), 'hex'));
    const nftInfo = await TezosNodeReader.getValueForBigMapKey(tezosUrl, 514, packedNftId);
    const ipfsUrlBytes = JSONPath({ path: '$.args[1][0].args[1].bytes', json: nftInfo })[0];
    const ipfsHash = Buffer.from(ipfsUrlBytes, 'hex').toString().slice(7);

    const nftDetails = await fetch(`https://cloudflare-ipfs.com/ipfs/${ipfsHash}`, { cache: 'no-store' });
    const nftDetailJson = await nftDetails.json();

    const nftName = nftDetailJson.name;
    const nftDescription = nftDetailJson.description;
    const nftCreators = nftDetailJson.creators
        .map((c) => c.trim())
        .map((c) => `${c.slice(0, 6)}...${c.slice(c.length - 6, c.length)}`)
        .join(', '); // TODO: use names where possible
    const nftArtifact = `https://cloudflare-ipfs.com/ipfs/${nftDetailJson.formats[0].uri.toString().slice(7)}`;
    const nftArtifactType = nftDetailJson.formats[0].mimeType.toString();

    return { name: nftName, description: nftDescription, creators: nftCreators, artifactUrl: nftArtifact, artifactType: nftArtifactType };
}

function chunkArray(arr: any[], len: number) {
    const chunks: any[] = [];
    const n = arr.length;

    let i = 0;
    while (i < n) {
        chunks.push(arr.slice(i, (i += len)));
    }

    return chunks;
}

// number of holders

// number of unique tokens
