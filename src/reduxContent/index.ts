import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { walletReducer } from './wallet/reducers';
import { messageReducer } from './message/reducers';
import { settingsReducer } from './settings/reducers';
import { RootState } from '../types/store';

export default function createRootReducer(history: any) {
  return combineReducers({
    router: connectRouter(history),
    wallet: walletReducer,
    settings: settingsReducer,
    message: messageReducer
  });
}
