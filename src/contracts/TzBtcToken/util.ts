import { JSONPath } from 'jsonpath-plus';
import { ConseilQueryBuilder, ConseilOperator, ConseilSortDirection, TezosConseilClient, TezosMessageUtils, TezosNodeReader } from 'conseiljs';

import * as status from '../../constants/StatusTypes';
import { Node } from '../../types/general';
import { createTokenTransaction, syncTransactionsWithState } from '../../utils/transaction';

export async function syncTokenTransactions(tokenAddress: string, managerAddress: string, node: Node, stateTransactions: any[]) {
    let newTransactions: any[] = (
        await getTokenTransactions(tokenAddress, managerAddress, node).catch((e) => {
            console.log('-debug: Error in: getSyncAccount -> getTokenTransactions for:' + tokenAddress);
            console.error(e);
            return [];
        })
    ).filter((obj, pos, arr) => arr.map((o) => o.operation_group_hash).indexOf(obj.operation_group_hash) === pos);

    const transferPattern = /Pair"([1-9A-Za-z^OIl]{36})"\(Pair"([1-9A-Za-z^OIl]{36})"([0-9]+)\)/;
    const mintPattern = /Pair"([1-9A-Za-z^OIl]{36})"([0-9]+)/;

    newTransactions = newTransactions.map((transaction) => {
        const params = transaction.parameters.replace(/\s/g, '');
        if (transferPattern.test(params)) {
            try {
                const parts = params.match(transferPattern);

                return createTokenTransaction({
                    ...transaction,
                    status: transaction.status !== 'applied' ? status.FAILED : status.READY,
                    amount: Number(parts[3]),
                    source: parts[1],
                    destination: parts[2],
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
                    destination: tokenAddress, // TODO: target address of mint operation parts[1]
                    entryPoint: 'mint',
                });
            } catch (e) {
                /* */
            }
        } else {
            // TODO
        }
    });

    return syncTransactionsWithState(newTransactions, stateTransactions);
}

async function getTokenTransactions(tokenAddress, managerAddress, node: Node) {
    // TODO: consider reusing the common function
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
        'parameters'
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
        'parameters'
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
            return transactions
                .filter((o) => o !== undefined)
                .filter((obj, pos, arr) => arr.map((o) => o.operation_group_hash).indexOf(obj.operation_group_hash) === pos);
        })
        .then((transactions) => {
            return transactions.sort((a, b) => a.timestamp - b.timestamp);
        });
}

export async function getAccountBalance(server: string, mapid: number, account: string): Promise<number> {
    const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(account, 'address'), 'hex'));
    const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);

    if (mapResult === undefined) {
        throw new Error(`Map ${mapid} does not contain a record for ${account}`);
    }

    const jsonresult = JSONPath({ path: '$.int', json: mapResult });
    return Number(jsonresult[0]);
}
