import { createSelector } from 'reselect';
import { RootState } from '../../types/store';

export const getWallet = (state: RootState) => state.wallet;
const identitiesSelector = (state: RootState) => state.wallet.identities;

export const getWalletName = createSelector(getWallet, wallet => {
  const fileName = wallet.walletFileName;
  const walletName = fileName.split('.');
  return walletName[0] || '';
});

export const getIsIdentitesSelector = createSelector(
  identitiesSelector,
  (identities): boolean => identities.length > 0
);
