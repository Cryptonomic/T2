import { createSelector } from 'reselect';
import { RootState } from '../../types/store';
import { getAddressType } from '../../utils/account';
import { AddressType } from '../../types/general';
import { TRANSACTIONS } from '../../constants/TabConstants';

const selectedAccountHashSelector = (state: RootState) => state.app.selectedAccountHash;
const selectedParentHashSelector = (state: RootState) => state.app.selectedParentHash;
const identitiesSelector = (state: RootState) => state.wallet.identities;

const tokensSelector = (state: RootState) => state.wallet.tokens;

const defaultAccount = {
    // TODO: define type
    balance: 0,
    activeTab: TRANSACTIONS,
    storeType: 0,
    status: '',
    script: '',
    secretKey: '',
    delegate_value: '',
    storage: '',
    regularAddresses: [],
    transactions: [],
};

export const getAccountSelector = createSelector(
    selectedAccountHashSelector,
    selectedParentHashSelector,
    identitiesSelector,
    (accountHash, parentHash, identities) => {
        const selectedIdentity = identities.find((identity) => identity.publicKeyHash === parentHash);
        if (selectedIdentity) {
            const { accounts, publicKeyHash, balance, secretKey } = selectedIdentity;
            const regularAddresses = [{ pkh: publicKeyHash, balance }];

            accounts.forEach((acc) => {
                const { script, account_id } = acc;
                const addressType = getAddressType(account_id, script);
                if (addressType === AddressType.Delegated) {
                    const newAddress = { pkh: account_id, balance: acc.balance };
                    regularAddresses.push(newAddress);
                }
            });
            if (accountHash === parentHash) {
                return {
                    ...defaultAccount,
                    regularAddresses,
                    ...selectedIdentity,
                };
            }
            const selectedAccount = accounts.find((acc) => acc.account_id === accountHash);
            if (selectedAccount) {
                return {
                    ...defaultAccount,
                    secretKey,
                    regularAddresses,
                    ...selectedAccount,
                };
            }
        }
        return defaultAccount;
    }
);

export const getTokenSelector = createSelector(
    selectedAccountHashSelector,
    tokensSelector,
    (accountHash, tokens) => tokens.find((token) => token.address === accountHash) || tokens[0]
);
