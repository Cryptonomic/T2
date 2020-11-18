import { ConseilQueryBuilder, ConseilOperator, ConseilSortDirection, TezosConseilClient } from 'conseiljs';

import * as status from '../../constants/StatusTypes';
import { Node } from '../../types/general';
import { createTokenTransaction, syncTransactionsWithState } from '../../utils/transaction';

export async function syncTokenTransactions(tokenAddress: string, managerAddress: string, node: Node, stateTransactions: any[]) {
    let newTransactions: any[] = await getTokenTransactions(tokenAddress, managerAddress, node).catch((e) => {
        console.log('-debug: Error in: getSyncAccount -> getTransactions for:' + tokenAddress);
        console.error(e);
        return [];
    });

    const addressPattern = '([1-9A-Za-z^OIl]{36})';
    const amountPattern = '([0-9]+)';

    const sendPattern = new RegExp(`\\{ Pair "${managerAddress}" \\{ ((Pair "${addressPattern}" \\(Pair 0 ${amountPattern}\\) ;? ?)+)`);
    const sendDestinationPattern = new RegExp(`Pair "${addressPattern}" \\(Pair 0 ${amountPattern}\\)`);
    const receivePattern = new RegExp(`[{] Pair "${managerAddress}" [(]Pair 0 (${amountPattern})[)] [}]`);
    const mintPattern = new RegExp(`[(]Pair [(]Pair "${managerAddress}" (${amountPattern})[)] [(]Pair "0" 0[))))]`);
    const burnPattern = new RegExp(`Right[(]Right[(]Right[(]Right[(]Pair"${addressPattern}"${amountPattern}[))))]`); // TODO

    newTransactions = newTransactions.map((transaction) => {
        const params = transaction.parameters;
        if (sendPattern.test(params)) {
            try {
                const parts = params.match(sendPattern);

                const innerParts = parts[1]
                    .split(';')
                    .map((s) => s.trim().match(sendDestinationPattern))
                    .map((r) => {
                        return { d: r[1], a: Number(r[2]) };
                    });

                let destination = 'multiple';
                let amount = innerParts[0].a;
                if (innerParts.length === 1) {
                    destination = innerParts[0].d;
                } else {
                    amount = innerParts.reduce((total, r) => total + r.a, 0);
                }

                return createTokenTransaction({
                    ...transaction,
                    status: transaction.status !== 'applied' ? status.FAILED : status.READY,
                    amount,
                    source: managerAddress,
                    destination,
                });
            } catch (e) {
                /* */
            }
        } else if (receivePattern.test(params)) {
            try {
                const parts = params.match(receivePattern);

                return createTokenTransaction({
                    ...transaction,
                    status: transaction.status !== 'applied' ? status.FAILED : status.READY,
                    amount: Number(parts[1]),
                    source: transaction.source, // TODO: doesn't take into account operator transfers
                    destination: managerAddress,
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
                    amount: parts[1],
                    source: transaction.source,
                    destination: managerAddress,
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
        } else {
            // TODO
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
        'parameters',
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
        }); // TODO: remove dupes
}
