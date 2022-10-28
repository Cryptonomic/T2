import { KeyStoreType } from 'conseiljs';

import { TRANSACTIONS } from '../constants/TabConstants';
import { CREATED, READY } from '../constants/StatusTypes';
import { Node, Identity } from '../types/general';

import { activateAndUpdateAccount } from './general';
import { getSyncTransactions, syncTransactionsWithState } from './transaction';
import { createAccount, getAccountsForIdentity, getSyncAccount, syncAccountWithState, combineAccounts } from './account';

export function createIdentity(identity: Identity): Identity {
    return {
        balance: 0,
        accounts: [],
        publicKeyHash: '',
        publicKey: '',
        secretKey: '',
        operations: {},
        order: 0,
        storeType: KeyStoreType.Fundraiser,
        activeTab: TRANSACTIONS,
        status: CREATED,
        transactions: [],
        delegate_value: '',
        ...identity,
    };
}

export function findIdentity(identities: Identity[], pkh: string): Identity {
    return (identities || []).find((identity) => identity.publicKeyHash === pkh) || identities[0];
}

export function findIdentityIndex(identities: Identity[], pkh: string): number {
    return (identities || []).findIndex((identity) => identity.publicKeyHash === pkh);
}

export async function getSyncIdentity(identity: Identity, node: Node, selectedAccountHash: string) {
    const { publicKeyHash, accounts } = identity;

    identity = await activateAndUpdateAccount(identity, node);

    let serverAccounts: any[] = await getAccountsForIdentity(node, publicKeyHash).catch((error) => {
        console.log(`-debug: Error in: status.getAccountsForIdentity for: ${publicKeyHash}`);
        console.error(error);
        return [];
    });

    serverAccounts = combineAccounts(accounts, serverAccounts);

    identity.accounts = await Promise.all(
        (serverAccounts || []).map(async (account, index) => {
            let newAccount = createAccount({ ...account, order: account.order || index + 1 });
            if (account.status !== READY) {
                newAccount = await getSyncAccount(newAccount, node, account.account_id, selectedAccountHash).catch((e) => {
                    console.log(`-debug: Error in: getSyncIdentity for: ${publicKeyHash}`);
                    console.error(e);
                    return newAccount;
                });
            } else {
                const existAccount = accounts.find((acc) => acc.account_id === account.account_id);
                if (existAccount) {
                    newAccount = {
                        ...newAccount,
                        transactions: existAccount.transactions,
                        status: existAccount.status,
                        operations: existAccount.operations,
                        activeTab: existAccount.activeTab || TRANSACTIONS,
                    };
                }

                if (selectedAccountHash === account.account_id) {
                    const transactions = await getSyncTransactions(selectedAccountHash, node, account.transactions);
                    newAccount = { ...newAccount, transactions };
                }
            }
            return newAccount;
        })
    );

    if (publicKeyHash === selectedAccountHash) {
        identity.transactions = await getSyncTransactions(publicKeyHash, node, identity.transactions);
    }

    return identity;
}

export function syncIdentityWithState(syncIdentity: Identity, stateIdentity: Identity) {
    const newAccounts = stateIdentity.accounts.filter((stateAcc) => {
        const syncAccIndex = syncIdentity.accounts.findIndex((syncIdentityAccount) => syncIdentityAccount.account_id === stateAcc.account_id);

        if (syncAccIndex > -1) {
            syncIdentity.accounts[syncAccIndex] = syncAccountWithState(syncIdentity.accounts[syncAccIndex], stateAcc);
            return false;
        }

        return true;
    });

    return {
        ...syncIdentity,
        activeTab: stateIdentity.activeTab,
        accounts: [...syncIdentity.accounts, ...newAccounts],
        transactions: syncTransactionsWithState(syncIdentity.transactions, stateIdentity.transactions),
    };
}
