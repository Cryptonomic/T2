import { ConseilQueryBuilder, ConseilOperator, ConseilSortDirection, TezosConseilClient } from 'conseiljs';

import * as status from '../../constants/StatusTypes';
import { Node, TokenKind } from '../../types/general';
import { createTokenTransaction, syncTransactionsWithState } from '../../utils/transaction';

export async function syncTokenTransactions(tokenAddress: string, managerAddress: string, node: Node, stateTransactions: any[], tokenKind: TokenKind) {
    let newTransactions: any[] = await getTokenTransactions(tokenAddress, managerAddress, node).catch(e => {
        console.log('-debug: Error in: getSyncAccount -> getTransactions for:' + tokenAddress);
        console.error(e);
        return [];
    });

    newTransactions = newTransactions.map(transaction => {
        try {
            const params = transaction.parameters.replace(/\s/g, '').match(/Pair"([1-9A-Za-z^OIl]{36})"\(Pair"([1-9A-Za-z^OIl]{36})"([0-9]+)\)/);
            console.log(`params: ${params[2]} ${Number(params[3])}`);
            return createTokenTransaction({
                ...transaction,
                status: status.READY,
                amount: Number(params[3]),
                source: params[1],
                destination: params[2]
            });
        } catch (e) {
            console.log(`---- failed ${JSON.stringify(transaction)} with ${e}\nparams: ${transaction.parameters.replace(/\s/g, '')}`);
            return createTokenTransaction({ ...transaction, status: status.READY });
        }
    });

    return syncTransactionsWithState(newTransactions, stateTransactions);
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
        'parameters'
    );
    direct = ConseilQueryBuilder.addPredicate(direct, 'kind', ConseilOperator.EQ, ['transaction'], false);
    direct = ConseilQueryBuilder.addPredicate(direct, 'status', ConseilOperator.EQ, ['applied'], false);
    direct = ConseilQueryBuilder.addPredicate(direct, 'destination', ConseilOperator.EQ, [tokenAddress], false);
    direct = ConseilQueryBuilder.addPredicate(direct, 'source', ConseilOperator.EQ, [managerAddress], false);
    direct = ConseilQueryBuilder.addOrdering(direct, 'timestamp', ConseilSortDirection.DESC);
    direct = ConseilQueryBuilder.setLimit(direct, 1_000);

    return Promise.all([direct].map(q => TezosConseilClient.getOperations({ url: conseilUrl, apiKey, network }, network, q)))
        .then(responses =>
            responses.reduce((result, r) => {
                r.forEach(rr => result.push(rr));
                return result;
            })
        )
        .then(transactions => transactions.sort((a, b) => a.timestamp - b.timestamp));
}
