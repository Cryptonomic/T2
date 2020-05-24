import { BigNumber } from 'bignumber.js';
import { ConseilQueryBuilder, ConseilOperator, ConseilSortDirection, TezosConseilClient, TezosNodeReader } from 'conseiljs';

import * as status from '../constants/StatusTypes';
import { Node, TokenTransaction, WalletTransaction } from '../types/general';
import { TRANSACTION } from '../constants/TransactionTypes';

export function createTransaction(transaction: any): WalletTransaction {
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
        ...newTransaction,
    };
}

export function processNodeOperationGroup(group: any): WalletTransaction {
    const first = group.contents[0];

    return {
        amount: new BigNumber(first.amount || 0).toNumber(),
        balance: 0,
        block_hash: '',
        block_level: -1,
        delegate_value: '',
        destination: first.destination || '',
        fee: parseInt(first.fee, 10),
        gas_limit: parseInt(first.gas_limit, 10),
        kind: first.kind,
        operation_group_hash: group.hash,
        operation_id: 'OPID',
        pkh: first.pkh || '',
        status: status.PENDING,
        source: first.source || '',
        storage_limit: parseInt(first.storage_limit, 10),
        timestamp: new Date(),
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
    parameters: '',
};

export function createTokenTransaction(transaction): TokenTransaction {
    const newTransaction = { ...transaction };

    if (typeof newTransaction.fee === 'string') {
        newTransaction.fee = Number(newTransaction.fee);
    }

    if (typeof newTransaction.amount === 'string') {
        newTransaction.amount = Number(newTransaction.amount);
    }

    return { ...initTokenTransaction, ...newTransaction };
}

export async function getIndexedTransactions(accountHash, node: Node) {
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

    return Promise.all([target, origin].map((q) => TezosConseilClient.getOperations({ url: conseilUrl, apiKey, network }, network, q)))
        .then((responses) => {
            return responses.reduce((result, r) => {
                r.forEach((rr) => result.push(rr));
                return result;
            });
        })
        .then((transactions) => transactions.sort((a, b) => a.timestamp - b.timestamp));
}

export function syncTransactionsWithState(remote: any[], local: any[]) {
    const cleanRemote = remote.filter((e) => e);
    const cleanLocal = local.filter((e) => e).filter((t) => t.status.toLowerCase() !== 'pending' && t.status.toLowerCase() !== 'created');

    const newTransactions = cleanLocal.filter((lt) => !cleanRemote.find((rt) => rt.operation_group_hash === lt.operation_group_hash));

    return [...remote, ...newTransactions].sort((a, b) => a.timestamp - b.timestamp);
}

export async function getSyncTransactions(accountHash: string, node: Node, stateTransactions: any[]) {
    const indexedTransaction: any[] = await getIndexedTransactions(accountHash, node).catch((e) => {
        console.error(`getIndexedTransactions(${accountHash}) failed`, e);
        return [];
    });

    const pendingTransactions = await TezosNodeReader.getMempoolOperationsForAccount(node.tezosUrl, accountHash);

    const transactions = indexedTransaction
        .map((t) => createTransaction({ ...t, status: status.READY }))
        .concat(pendingTransactions.map((g) => processNodeOperationGroup(g)));

    return syncTransactionsWithState(transactions, stateTransactions);
}
