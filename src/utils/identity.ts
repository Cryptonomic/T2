import { StoreType } from 'conseiljs';
import { TRANSACTIONS } from '../constants/TabConstants';
import { CREATED, READY } from '../constants/StatusTypes';
import { Node, Identity } from '../types/general';

import { activateAndUpdateAccount } from './general';
import { getSyncTransactions, syncTransactionsWithState } from './transaction';
import {
  createAccount,
  getAccountsForIdentity,
  getSyncAccount,
  syncAccountWithState
} from './account';

export function createIdentity(identity: Identity): Identity {
  return {
    balance: 0,
    accounts: [],
    publicKeyHash: '',
    publicKey: '',
    privateKey: '',
    operations: {},
    order: 0,
    storeType: StoreType.Fundraiser,
    activeTab: TRANSACTIONS,
    status: CREATED,
    transactions: [],
    delegate_value: '',
    ...identity
  };
}

export function findIdentity(identities: Identity[], pkh: string): Identity {
  return (identities || []).find(identity => identity.publicKeyHash === pkh) || identities[0];
}

export function findIdentityIndex(identities: Identity[], pkh: string): number {
  return (identities || []).findIndex(identity => identity.publicKeyHash === pkh);
}

export async function getSyncIdentity(identity: Identity, node: Node, selectedAccountHash: string) {
  const { publicKeyHash, accounts } = identity;

  identity = await activateAndUpdateAccount(identity, node);
  /*
   *  we are taking state identity accounts overriding their state
   *  with the new account we got from setAccounts.. check if any of any new accounts
   *  were create and are state identity but dont come back from getAccount and contact
   *  those accounts with the updated accounts we got from getAccounts.
   * */

  let serverAccounts: any[] = await getAccountsForIdentity(node, publicKeyHash).catch(error => {
    console.log(`-debug: Error in: status.getAccountsForIdentity for: ${publicKeyHash}`);
    console.error(error);
    return [];
  });

  // const stateAccountIndices = identity.accounts.map(account => account.account_id);
  const accountIndices: any[] = [];

  serverAccounts = serverAccounts.map(srAcc => {
    accountIndices.push(srAcc.account_id);
    let newAccount = { ...srAcc };
    const existAccount = accounts.find(acc => acc.account_id === srAcc.account_id);
    if (existAccount) {
      newAccount = {
        ...newAccount,
        status: existAccount.status,
        operations: existAccount.operations,
        activeTab: existAccount.activeTab,
        order: existAccount.order,
        transactions: existAccount.transactions
      };
    }
    return createAccount(newAccount);
  });

  // the accounts which only exist in local
  const accountsToConcat = accounts.filter(account => {
    return accountIndices.indexOf(account.account_id) === -1;
  });

  serverAccounts = [...serverAccounts, ...accountsToConcat];

  identity.accounts = await Promise.all(
    (serverAccounts || []).map(async (account, index) => {
      account.order = account.order || index + 1;
      if (account.status !== READY) {
        return await getSyncAccount(account, node, account.account_id, selectedAccountHash).catch(
          e => {
            console.log(`-debug: Error in: getSyncIdentity for: ${publicKeyHash}`);
            console.error(e);
            return account;
          }
        );
      } else if (selectedAccountHash === account.account_id) {
        account.transactions = await getSyncTransactions(
          selectedAccountHash,
          node,
          account.transactions
        );
      }
      return account;
    })
  );

  if (publicKeyHash === selectedAccountHash) {
    identity.transactions = await getSyncTransactions(publicKeyHash, node, identity.transactions);
  }

  return identity;
}

export function syncIdentityWithState(syncIdentity: Identity, stateIdentity: Identity) {
  const newAccounts = stateIdentity.accounts.filter(stateAcc => {
    const syncAccIndex = syncIdentity.accounts.findIndex(
      syncIdentityAccount => syncIdentityAccount.account_id === stateAcc.account_id
    );

    if (syncAccIndex > -1) {
      syncIdentity.accounts[syncAccIndex] = syncAccountWithState(
        syncIdentity.accounts[syncAccIndex],
        stateAcc
      );
      return false;
    }

    return true;
  });

  return {
    ...syncIdentity,
    activeTab: stateIdentity.activeTab,
    accounts: [...syncIdentity.accounts, ...newAccounts],
    transactions: syncTransactionsWithState(syncIdentity.transactions, stateIdentity.transactions)
  };
}
