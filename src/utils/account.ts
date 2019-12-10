import {
  ConseilQueryBuilder,
  ConseilOperator,
  ConseilDataClient,
  ConseilSortDirection
} from 'conseiljs';
import * as blakejs from 'blakejs';
import * as status from '../constants/StatusTypes';
import { TEZOS, CONSEIL } from '../constants/NodesTypes';
import { TRANSACTIONS } from '../constants/TabConstants';
import { getSyncTransactions, syncTransactionsWithState } from './transaction';
import {
  activateAndUpdateAccount
  // getSelectedKeyStore,
  // getSelectedHash
} from './general';

import { Node, AddressType } from '../types/general';

export function createAccount(account, identity) {
  return {
    account_id: '',
    balance: 0,
    block_id: '',
    counter: 0,
    delegate_setable: false,
    delegate_value: null,
    manager: '',
    script: '',
    spendable: true,
    transactions: [],
    activeTab: TRANSACTIONS,
    status: status.CREATED,
    operations: {},
    order: 0,
    publicKey: identity.publicKey,
    privateKey: identity.privateKey,
    ...account
  };
}

export function findAccount(identity, accountId) {
  return identity && (identity.accounts || []).find(account => account.account_id === accountId);
}

export function findAccountIndex(identity, accountId) {
  return (
    identity && (identity.accounts || []).findIndex(account => account.account_id === accountId)
  );
}

// export function createSelectedAccount({ balance = 0, transactions = [] } = {}) {
//   return { balance, transactions };
// }

export async function getAccountsForIdentity(node: Node, pkh: string) {
  const { conseilUrl, apiKey, network, platform } = node;
  const serverInfo = { url: conseilUrl, apiKey, network };

  let originationQuery = ConseilQueryBuilder.blankQuery();
  originationQuery = ConseilQueryBuilder.addFields(originationQuery, 'originated_contracts');
  originationQuery = ConseilQueryBuilder.addPredicate(
    originationQuery,
    'kind',
    ConseilOperator.EQ,
    ['origination'],
    false
  );
  originationQuery = ConseilQueryBuilder.addPredicate(
    originationQuery,
    'source',
    ConseilOperator.EQ,
    [pkh],
    false
  );
  originationQuery = ConseilQueryBuilder.addPredicate(
    originationQuery,
    'status',
    ConseilOperator.EQ,
    ['applied'],
    false
  );
  originationQuery = ConseilQueryBuilder.setLimit(originationQuery, 1000);

  const originations = await ConseilDataClient.executeEntityQuery(
    serverInfo,
    platform,
    network,
    'operations',
    originationQuery
  );

  if (originations.length === 0) {
    return [];
  }

  let accountQuery = ConseilQueryBuilder.blankQuery();
  if (originations.length === 1) {
    accountQuery = ConseilQueryBuilder.addPredicate(
      accountQuery,
      'account_id',
      ConseilOperator.EQ,
      [originations[0].originated_contracts],
      false
    );
  } else {
    accountQuery = ConseilQueryBuilder.addPredicate(
      accountQuery,
      'account_id',
      ConseilOperator.IN,
      originations.map(o => o.originated_contracts),
      false
    );
  }

  accountQuery = ConseilQueryBuilder.setLimit(accountQuery, originations.length);
  const accounts = await ConseilDataClient.executeEntityQuery(
    serverInfo,
    platform,
    network,
    'accounts',
    accountQuery
  );

  return accounts;
}

export async function getSyncAccount(
  account,
  node: Node,
  accountHash: string,
  selectedAccountHash: string
) {
  account = await activateAndUpdateAccount(account, node).catch(e => {
    console.log(`-debug: Error in: getSyncAccount for: ${accountHash}`);
    console.error(e);
    return account;
  });

  if (accountHash === selectedAccountHash) {
    account.transactions = await getSyncTransactions(accountHash, node, account.transactions);
  }
  return { ...account };
}

export function syncAccountWithState(syncAccount, stateAccount) {
  return {
    ...syncAccount,
    activeTab: stateAccount.activeTab,
    transactions: syncTransactionsWithState(syncAccount.transactions, stateAccount.transactions)
  };
}

export function getAddressType(address: string, script: string | undefined): AddressType {
  if (address.startsWith('tz1') || address.startsWith('tz2') || address.startsWith('tz3')) {
    return AddressType.Manager;
  }
  if (script !== undefined && script.length > 0 && address.startsWith('KT1')) {
    const k = Buffer.from(blakejs.blake2s(script.toString(), null, 16)).toString('hex');

    if (k === '023fc21b332d338212185c817801f288') {
      return AddressType.Delegated;
    }
    return AddressType.Smart;
  }
  return AddressType.None;
}
