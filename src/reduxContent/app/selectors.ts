import { createSelector } from 'reselect';
import { RootState } from '../../types/store';
import { getWallet } from '../wallet/selectors';
import { getAddressType, findAccount } from '../../utils/account';
import { AddressType } from '../../types/general';
import { TRANSACTIONS } from '../../constants/TabConstants';

export const getApp = (state: RootState) => state.app;

const selectedAccountHashSelector = (state: RootState) => state.app.selectedAccountHash;
const selectedParentHashSelector = (state: RootState) => state.app.selectedParentHash;
const identitiesSelector = (state: RootState) => state.wallet.identities;

const defaultAccount = {
  balance: 0,
  activeTab: TRANSACTIONS,
  storeType: 0,
  status: '',
  script: undefined,
  privateKey: '',
  delegate_value: '',
  storage: '',
  regularAddresses: [],
  transactions: []
};

export const getAccountSelector = createSelector(
  selectedAccountHashSelector,
  selectedParentHashSelector,
  identitiesSelector,
  (accountHash, parentHash, identites) => {
    console.log('identitiesSelector-----', identites, parentHash, accountHash);
    const selectedIdentity = identites.find(identity => identity.publicKeyHash === parentHash);
    if (selectedIdentity) {
      const {
        accounts,
        publicKeyHash,
        balance,
        transactions,
        privateKey,
        storeType,
        delegate_value,
        status
      } = selectedIdentity;
      const regularAddresses = [{ pkh: publicKeyHash, balance }];

      accounts.forEach(acc => {
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
          status,
          balance,
          regularAddresses,
          transactions,
          privateKey,
          storeType,
          delegate_value
        };
      }
      const selectedAccount = accounts.find(acc => acc.account_id === accountHash);
      return {
        ...defaultAccount,
        privateKey,
        regularAddresses,
        transactions: selectedAccount.transactions,
        storeType: selectedAccount.storeType,
        delegate_value: selectedAccount.delegate_value,
        script: selectedAccount.script,
        storage: selectedAccount.storage,
        balance: selectedAccount.balance,
        status: selectedAccount.status
      };
    }
    // if (accountHash === parentHash) {
    //   return { ...selectedIdentify };
    // }
    return defaultAccount;
  }
);
