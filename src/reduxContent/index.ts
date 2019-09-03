import { combineReducers } from 'redux';

import { WalletState, walletReducer } from './wallet/reducers';

export interface RootState {
  wallet: WalletState;
}

export const rootReducer = combineReducers<RootState | undefined>({
  wallet: walletReducer
});
