import { ConseilQueryBuilder, ConseilOperator, ConseilSortDirection, TezosConseilClient } from 'conseiljs';

import * as status from '../constants/StatusTypes';
import { Node, TokenTransaction, TokenKind } from '../types/general';
import { TRANSACTION } from '../constants/TransactionTypes';
import { tokenRegStrs } from '../constants/Token';

export function createTransaction(transaction) {
    const newTransaction = { ...transaction };

    if (typeof newTransaction.balance === 'string') {
        newTransaction.balance = Number(newTransaction.balance);
    }

    if (typeof newTransaction.fee === 'string') {
        newTransaction.fee = Number(newTransaction.fee);
    }

    if (typeof newTransaction.amount === 'string') {
        newTransaction.amount = Number(newTransaction.amount);
    }

    return {
        amount: null,
        balance: null,
        block_hash: null,
        block_level: null,
        delegate_value: null,
        destination: null,
        fee: null,
        gas_limit: null,
        kind: null,
        operation_group_hash: null,
        operation_id: null,
        pkh: null,
        status: status.CREATED,
        source: null,
        storage_limit: null,
        timestamp: Date.now(),
        ...newTransaction
    };
}

const initTokenTransaction: TokenTransaction = {
    amount: 0,
    block_level: '',
    destination: '',
    fee: 0,
    kind: TRANSACTION,
    operation_group_hash: '',
    status: status.CREATED,
    source: '',
    timestamp: Date.now(),
    parameters: ''
};

export function createTokenTransaction(transaction): TokenTransaction {
    const newTransaction = { ...transaction };

    if (typeof newTransaction.fee === 'string') {
        newTransaction.fee = Number(newTransaction.fee);
    }

    if (typeof newTransaction.amount === 'string') {
        newTransaction.amount = Number(newTransaction.amount);
    }

    return { initTokenTransaction, ...newTransaction };
}

export async function getTransactions(accountHash, node: Node) {
    const { conseilUrl, apiKey, network } = node;

    let origin = ConseilQueryBuilder.blankQuery();
    origin = ConseilQueryBuilder.addPredicate(
        origin,
        'kind',
        ConseilOperator.IN,
        ['transaction', 'activate_account', 'reveal', 'origination', 'delegation'],
        false
    );
    origin = ConseilQueryBuilder.addPredicate(origin, 'source', ConseilOperator.EQ, [accountHash], false);
    origin = ConseilQueryBuilder.addPredicate(origin, 'internal', ConseilOperator.EQ, ['false'], false);
    origin = ConseilQueryBuilder.addOrdering(origin, 'block_level', ConseilSortDirection.DESC);
    origin = ConseilQueryBuilder.setLimit(origin, 1_000);

    let target = ConseilQueryBuilder.blankQuery();
    target = ConseilQueryBuilder.addPredicate(
        target,
        'kind',
        ConseilOperator.IN,
        ['transaction', 'activate_account', 'reveal', 'origination', 'delegation'],
        false
    );
    target = ConseilQueryBuilder.addPredicate(target, 'destination', ConseilOperator.EQ, [accountHash], false);
    target = ConseilQueryBuilder.addPredicate(target, 'internal', ConseilOperator.EQ, ['false'], false);
    target = ConseilQueryBuilder.addOrdering(target, 'block_level', ConseilSortDirection.DESC);
    target = ConseilQueryBuilder.setLimit(target, 1_000);

    return Promise.all([target, origin].map(q => TezosConseilClient.getOperations({ url: conseilUrl, apiKey, network }, network, q)))
        .then(responses => {
            return responses.reduce((result, r) => {
                r.forEach(rr => result.push(rr));
                return result;
            });
        })
        .then(transactions => transactions.sort((a, b) => a.timestamp - b.timestamp));
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

    return Promise.all([direct, indirect].map(q => TezosConseilClient.getOperations({ url: conseilUrl, apiKey, network }, network, q)))
        .then(responses =>
            responses.reduce((result, r) => {
                r.forEach(rr => result.push(rr));
                return result;
            })
        )
        .then(transactions => {
            return transactions.sort((a, b) => a.timestamp - b.timestamp);
        });
}

export function syncTransactionsWithState(remote: TokenTransaction[], local: TokenTransaction[]) {
    const cleanRemote = remote.filter(e => e);
    const cleanLocal = local.filter(e => e);

    const newTransactions = cleanLocal.filter(tr => !cleanRemote.find(syncTr => syncTr.operation_group_hash === tr.operation_group_hash));

    return [...remote, ...newTransactions].sort((a, b) => a.timestamp - b.timestamp);
}

export async function getSyncTransactions(accountHash: string, node: Node, stateTransactions: any[]) {
    let newTransactions: any[] = await getTransactions(accountHash, node).catch(e => {
        console.log('-debug: Error in: getSyncAccount -> getTransactions for:' + accountHash);
        console.error(e);
        return [];
    });

    newTransactions = newTransactions.map(transaction => createTransaction({ ...transaction, status: status.READY }));

    return syncTransactionsWithState(newTransactions, stateTransactions);
}

export async function getSyncTokenTransactions(tokenAddress: string, managerAddress: string, node: Node, stateTransactions: any[], tokenKind: TokenKind) {
    let newTransactions: any[] = await getTokenTransactions(tokenAddress, managerAddress, node).catch(e => {
        console.log('-debug: Error in: getSyncAccount -> getTransactions for:' + tokenAddress);
        console.error(e);
        return [];
    });

    newTransactions = newTransactions.map(transaction => {
        try {
            const params = transaction.parameters.replace(/\s/g, '').match(tokenRegStrs[tokenKind]);
            return createTokenTransaction({
                ...transaction,
                status: status.READY,
                amount: Number(params[3]),
                source: params[1],
                destination: params[2]
            });
        } catch (e) {
            console.log(`---- failed ${JSON.stringify(transaction)} with ${e}`);
            return createTokenTransaction({ ...transaction, status: status.READY });
        }
    });

    return syncTransactionsWithState(newTransactions, stateTransactions);
}
