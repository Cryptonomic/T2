import { createSelector } from 'reselect';
import { RootState } from '../../../types/store';

const selectedAccountHashSelector = (state: RootState) => state.app.selectedAccountHash;
const tokensSelector = (state: RootState) => state.wallet.tokens;

export const getTokenSelector = createSelector(
  selectedAccountHashSelector,
  tokensSelector,
  (accountHash, tokens) => tokens.find(token => token.address === accountHash) || tokens[0]
);
