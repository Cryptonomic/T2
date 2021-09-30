// import { setData, getData } from '../../localData';
import { AppState } from '../../types/store';
import { AddressType } from '../../types/general';
import {
    SET_IS_LOADING,
    LOGOUT,
    SET_LEDGER,
    SET_IS_LEDGER_CONNECTING,
    WALLET_IS_SYNCING,
    ADD_NEW_VERSION,
    SET_NODES_STATUS,
    UPDATE_FETCHED_TIME,
    CHANGE_ACCOUNT_HASH,
    AppActionTypes,
    SET_SIGNER,
    SET_BEACON_CLIENT,
    SET_BEACON_MESSAGE,
    SET_BEACON_LOADING,
    SET_LAUNCH_URL,
} from './types';

const initState: AppState = {
    isLedger: false,
    isLedgerConnecting: false,
    isLoading: false,
    isWalletSyncing: false,
    nodesStatus: {
        conseil: -1,
        tezos: -1,
    },
    time: new Date(),
    newVersion: '',
    selectedAccountHash: '',
    selectedParentHash: '',
    selectedParentIndex: 0,
    selectedAccountIndex: 0,
    selectedAccountType: AddressType.Manager,
    selectedTokenName: '',
    signer: null,
    beaconMessage: null,
    beaconLoading: false,
    beaconClient: false,
    beaconConnection: null,
    launchUrl: null,
};

export function appReducer(state: AppState = initState, action: AppActionTypes) {
    switch (action.type) {
        case SET_IS_LOADING:
            return { ...state, isLoading: action.isLoading };
        case SET_NODES_STATUS:
            return { ...state, nodesStatus: action.nodesStatus };
        case UPDATE_FETCHED_TIME:
            return { ...state, time: action.time };
        case LOGOUT:
            return initState;
        case SET_LEDGER:
            return { ...state, isLedger: action.isLedger };
        case SET_IS_LEDGER_CONNECTING:
            return { ...state, isLedgerConnecting: action.isLedgerConnecting };
        case WALLET_IS_SYNCING:
            return { ...state, isWalletSyncing: action.isWalletSyncing };
        case ADD_NEW_VERSION:
            return { ...state, newVersion: action.newVersion };
        case CHANGE_ACCOUNT_HASH:
            return { ...state, ...action.payload };
        case SET_SIGNER:
            return { ...state, signer: action.signer };
        case SET_BEACON_CLIENT:
            return { ...state, beaconClient: action.beaconClient };
        case SET_BEACON_MESSAGE:
            return { ...state, beaconMessage: action.beaconMessage, beaconConnection: action.beaconConnection };
        case SET_BEACON_LOADING:
            return { ...state, beaconLoading: action.beaconLoading };
        case SET_LAUNCH_URL:
            return { ...state, launchUrl: action.url };
        default:
            return state;
    }
}
