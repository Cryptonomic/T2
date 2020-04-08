import {
  ConseilQueryBuilder,
  ConseilOperator,
  ConseilSortDirection,
  TezosConseilClient
} from 'conseiljs';

import * as status from '../constants/StatusTypes';
import { Node } from '../types/general';

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
  origin = ConseilQueryBuilder.addPredicate(
    origin,
    'source',
    ConseilOperator.EQ,
    [accountHash],
    false
  );
  origin = ConseilQueryBuilder.addPredicate(
    origin,
    'internal',
    ConseilOperator.EQ,
    ['false'],
    false
  );
  origin = ConseilQueryBuilder.addOrdering(origin, 'block_level', ConseilSortDirection.DESC);
  origin = ConseilQueryBuilder.setLimit(origin, 300);

  let target = ConseilQueryBuilder.blankQuery();
  target = ConseilQueryBuilder.addPredicate(
    target,
    'kind',
    ConseilOperator.IN,
    ['transaction', 'activate_account', 'reveal', 'origination', 'delegation'],
    false
  );
  target = ConseilQueryBuilder.addPredicate(
    target,
    'destination',
    ConseilOperator.EQ,
    [accountHash],
    false
  );
  target = ConseilQueryBuilder.addPredicate(
    target,
    'internal',
    ConseilOperator.EQ,
    ['false'],
    false
  );
  target = ConseilQueryBuilder.addOrdering(target, 'block_level', ConseilSortDirection.DESC);
  target = ConseilQueryBuilder.setLimit(target, 300);

  return Promise.all(
    [target, origin].map(q =>
      TezosConseilClient.getOperations({ url: conseilUrl, apiKey, network }, network, q)
    )
  ).then(responses =>
    responses.reduce((result, r) => {
      r.forEach(rr => result.push(rr));
      return result;
    })
  );
  // TODO sort by timestamp
}

export async function getTokenTransactions(tokenAddress, managerAddress, node: Node) {
  const { conseilUrl, apiKey, network } = node;

  let query = ConseilQueryBuilder.blankQuery();
  query = ConseilQueryBuilder.addFields(
    query,
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
  query = ConseilQueryBuilder.addPredicate(
    query,
    'kind',
    ConseilOperator.EQ,
    ['transaction'],
    false
  );
  query = ConseilQueryBuilder.addPredicate(query, 'status', ConseilOperator.EQ, ['applied'], false);
  query = ConseilQueryBuilder.addPredicate(
    query,
    'destination',
    ConseilOperator.EQ,
    [tokenAddress],
    false
  );
  query = ConseilQueryBuilder.addPredicate(
    query,
    'parameters',
    ConseilOperator.LIKE,
    [managerAddress],
    false
  );
  query = ConseilQueryBuilder.addOrdering(query, 'timestamp', ConseilSortDirection.DESC);
  query = ConseilQueryBuilder.setLimit(query, 1000);
  return await TezosConseilClient.getOperations(
    { url: conseilUrl, apiKey, network },
    network,
    query
  ).catch(e => []);
}

export function syncTransactionsWithState(serverTrs: any[], localTrs: any[]) {
  const newTransactions = localTrs.filter(
    tr => !serverTrs.find(syncTr => syncTr.operation_group_hash === tr.operation_group_hash)
  );

  return [...serverTrs, ...newTransactions];
}

export async function getSyncTransactions(
  accountHash: string,
  node: Node,
  stateTransactions: any[]
) {
  let newTransactions: any[] = await getTransactions(accountHash, node).catch(e => {
    console.log('-debug: Error in: getSyncAccount -> getTransactions for:' + accountHash);
    console.error(e);
    return [];
  });

  newTransactions = newTransactions.map(transaction =>
    createTransaction({
      ...transaction,
      status: status.READY
    })
  );

  return syncTransactionsWithState(newTransactions, stateTransactions);
}

const tokenRegex = /Left[(]Left[(]Left[(]Pair"([A-Za-z0-9]*)"[(]Pair"([A-Za-z0-9]*)["]([0-9]*)[))))]/;

export async function getSyncTokenTransactions(
  tokenAddress: string,
  managerAddress: string,
  node: Node,
  stateTransactions: any[]
) {
  let newTransactions: any[] = await getTokenTransactions(tokenAddress, managerAddress, node).catch(
    e => {
      console.log('-debug: Error in: getSyncAccount -> getTransactions for:' + tokenAddress);
      console.error(e);
      return [];
    }
  );

  newTransactions = newTransactions.map(transaction => {
    const params = transaction.parameters.replace(/\s/g, '').match(tokenRegex);
    return createTransaction({
      ...transaction,
      status: status.READY,
      amount: params[3],
      source: params[1],
      destination: params[2]
    });
  });

  return syncTransactionsWithState(newTransactions, stateTransactions);
}
