import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { WalletState, walletReducer } from './wallet/reducers';

export interface RootState {
  router: any;
  wallet: WalletState;
}

export default function createRootReducer(history: any) {
  return combineReducers<RootState | undefined>({
    router: connectRouter(history),
    wallet: walletReducer
  });
}
