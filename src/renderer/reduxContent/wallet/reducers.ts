import { WalletState } from '../../types/store';
import {
    SET_WALLET,
    SET_WALLET_FILENAME,
    SET_WALLET_LOCATION,
    SET_PASSWORD,
    SET_IDENTITIES,
    ADD_NEW_IDENTITY,
    UPDATE_IDENTITY,
    UPDATE_TOKENS,
    WalletActionTypes
} from './types';

import { LOGOUT, LogoutAction } from '../app/types';

const defaultState: WalletState = {
    identities: [],
    walletPassword: '',
    walletFileName: '',
    walletLocation: '',
    tokens: []
};

export function walletReducer(state: WalletState = defaultState, action: WalletActionTypes | LogoutAction) {
    switch (action.type) {
        case SET_WALLET:
            return { ...state, ...action.payload };
        case SET_WALLET_FILENAME:
            return { ...state, walletFileName: action.walletFileName };
        case SET_WALLET_LOCATION:
            return { ...state, walletLocation: action.walletLocation };
        case SET_PASSWORD:
            return { ...state, walletPassword: action.password };
        case SET_IDENTITIES:
            return { ...state, identities: action.identities };
        case ADD_NEW_IDENTITY: {
            return { ...state, identities: [...state.identities, action.identity] };
        }
        case UPDATE_IDENTITY: {
            const { publicKeyHash } = action.identity;
            const stateIdentities = [...state.identities];
            const indexFound = stateIdentities.findIndex(identity => publicKeyHash === identity.publicKeyHash);

            if (indexFound > -1) {
                stateIdentities[indexFound] = action.identity;
                return { ...state, identities: [...stateIdentities] };
            }
            return state;
        }
        case UPDATE_TOKENS: {
            return { ...state, tokens: action.tokens };
        }
        case LOGOUT: {
            return defaultState;
        }
        default:
            return state;
    }
}
