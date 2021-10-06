import { createSelector } from 'reselect';
import { RootState } from '../../types/store';
import { getAddressType } from '../../utils/account';
import { AddressType, Account, Identity, TokenKind } from '../../types/general';
import { TRANSACTIONS } from '../../constants/TabConstants';

const selectedAccountHashSelector = (state: RootState) => state.app.selectedAccountHash;
const selectedTokenNameSelector = (state: RootState) => state.app.selectedTokenName;
const selectedParentHashSelector = (state: RootState) => state.app.selectedParentHash;
const identitiesSelector = (state: RootState) => state.wallet.identities;

const tokensSelector = (state: RootState) => state.wallet.tokens;

interface IRegularAddress {
    pkh: string;
    balance: number;
}

export interface AccountSelector extends Partial<Account>, Partial<Identity> {
    balance: number;
    regularAddresses: IRegularAddress[];
    script: string;
    secretKey: string;
    storage: string;
    transactions: any[];
}

const defaultAccount: AccountSelector = {
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
    (accountHash, parentHash, identities): AccountSelector => {
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
    selectedTokenNameSelector,
    tokensSelector,
    (accountHash, tokenName, tokens) =>
        tokens.find((token) => token.address === accountHash && (tokenName === '' || token.displayName === tokenName)) || tokens[0]
);

export const getNFTTokensSelector = createSelector(tokensSelector, (tokens) => tokens.filter((token) => [TokenKind.objkt].includes(token.kind)));
