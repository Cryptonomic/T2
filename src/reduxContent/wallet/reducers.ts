// import { setData, getData } from '../../localData';
import { fromJS } from 'immutable';
import { WalletAction } from './actions';

import {
  SET_WALLET,
  SET_IS_LOADING,
  SET_WALLET_FILENAME,
  SET_WALLET_LOCATION,
  SET_PASSWORD,
  SET_IDENTITIES,
  SET_NODES_STATUS,
  ADD_NEW_IDENTITY,
  UPDATE_IDENTITY,
  UPDATE_FETCHED_TIME,
  LOGOUT,
  SET_LEDGER,
  SET_IS_LEDGER_CONNECTIONG,
  WALLET_IS_SYNCING
} from './types';

export interface WalletState {
  identities: any[];
  isLoading: boolean;
  isWalletSyncing: boolean;
  walletFileName: string;
  walletLocation: string;
  password: string;
  nodesStatus: any;
  time: any;
  isLedger: boolean;
  isLedgerConnecting: boolean;
}

const defaultState = fromJS({
  identities: [],
  isLoading: false,
  isWalletSyncing: false,
  walletFileName: '',
  walletLocation: '',
  password: '',
  nodesStatus: {
    tezos: {
      responsive: true,
      level: 0
    },
    conseil: {
      responsive: true,
      level: 0
    }
  },
  time: new Date(),
  isLedger: false,
  isLedgerConnecting: false
});

export function walletReducer(state = defaultState, action: WalletAction) {
  switch (action.type) {
    case SET_WALLET:
      return fromJS({ ...state.toJS(), ...action.wallet });
    case SET_IS_LOADING:
      return state.set('isLoading', action.isLoading);
    case SET_WALLET_FILENAME:
      return state.set('walletFileName', action.walletFileName);
    case SET_WALLET_LOCATION:
      return state.set('walletLocation', action.walletLocation);
    case SET_PASSWORD:
      return state.set('password', action.password);
    case SET_IDENTITIES:
      return state.set('identities', fromJS(action.identities));
    case SET_NODES_STATUS:
      return state.set('nodesStatus', fromJS(action.nodesStatus));
    case ADD_NEW_IDENTITY: {
      const newIdentity = fromJS(action.identity);
      return state.update('identities', (identities: any[]) => identities.push(newIdentity));
    }
    case UPDATE_IDENTITY: {
      const { publicKeyHash } = action.identity;
      const identities = state.get('identities');
      const indexFound = identities.findIndex(
        (identity: any) => publicKeyHash === identity.get('publicKeyHash')
      );

      if (indexFound > -1) {
        return state.set('identities', identities.set(indexFound, fromJS(action.identity)));
      }
      return state;
    }
    case UPDATE_FETCHED_TIME:
      return state.set('time', action.time);
    case LOGOUT:
      return defaultState;
    case SET_LEDGER:
      return state.set('isLedger', action.isLedger);
    case SET_IS_LEDGER_CONNECTIONG:
      return state.set('isLedgerConnecting', action.isLedgerConnecting);
    case WALLET_IS_SYNCING:
      return state.set('isWalletSyncing', action.isWalletSyncing);
    default:
      return state;
  }
}
