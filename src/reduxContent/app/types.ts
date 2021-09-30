import { NodeStatus, AddressType } from '../../types/general';
import { Signer } from 'conseiljs';
import { BeaconRequestOutputMessage, ConnectionContext } from '@airgap/beacon-sdk';

export const SET_IS_LOADING = 'SET_IS_LOADING';
export const SET_LEDGER = 'SET_LEDGER';
export const SET_IS_LEDGER_CONNECTING = 'SET_IS_LEDGER_CONNECTING';
export const WALLET_IS_SYNCING = 'WALLET_IS_SYNCING';
export const ADD_NEW_VERSION = 'ADD_NEW_VERSION';
export const SET_NODES_STATUS = 'SET_NODES_STATUS';
export const UPDATE_FETCHED_TIME = 'UPDATE_FETCHED_TIME';
export const CHANGE_ACCOUNT_HASH = 'CHANGE_ACCOUNT_HASH';
export const SHOW_SIGN_VERIFY = 'SHOW_SIGN_VERIFY';
export const LOGOUT = 'LOGOUT';
export const SET_SIGNER = 'SET_SIGNER';
export const SET_BEACON_MESSAGE = 'SET_BEACON_MESSAGE';
export const SET_BEACON_LOADING = 'SET_BEACON_LOADING';
export const SET_BEACON_CLIENT = 'SET_BEACON_CLIENT';
export const SET_LAUNCH_URL = 'SET_LAUNCH_URL';

export interface SetBeaconClientAction {
    type: typeof SET_BEACON_CLIENT;
    beaconClient: boolean;
}

export interface SetBeaconMessageAction {
    type: typeof SET_BEACON_MESSAGE;
    beaconMessage: BeaconRequestOutputMessage | null;
    beaconConnection: ConnectionContext | null;
}

export interface SetBeaconLoadingAction {
    type: typeof SET_BEACON_LOADING;
    beaconLoading: boolean;
}

export interface SetSignerAction {
    type: typeof SET_SIGNER;
    signer: Signer;
}

export interface SetIsLoadingAction {
    type: typeof SET_IS_LOADING;
    isLoading: boolean;
}

export interface LogoutAction {
    type: typeof LOGOUT;
}

export interface ShowSignVerifyAction {
    type: typeof SHOW_SIGN_VERIFY;
}

export interface SetLedgerAction {
    type: typeof SET_LEDGER;
    isLedger: boolean;
}

export interface SetIsLedgerConnectingAction {
    type: typeof SET_IS_LEDGER_CONNECTING;
    isLedgerConnecting: boolean;
}

export interface SetWalletIsSyncingAction {
    type: typeof WALLET_IS_SYNCING;
    isWalletSyncing: boolean;
}

export interface AddNewVersionAction {
    type: typeof ADD_NEW_VERSION;
    newVersion: string;
}

export interface SetNodesStatusAction {
    type: typeof SET_NODES_STATUS;
    nodesStatus: NodeStatus;
}

export interface UpdateFetchedTimeAction {
    type: typeof UPDATE_FETCHED_TIME;
    time: any;
}

export interface SetLaunchUrlAction {
    type: typeof SET_LAUNCH_URL;
    url: string;
}

export interface ChangeAccountType {
    selectedAccountHash: string;
    selectedParentHash: string;
    selectedParentIndex: number;
    selectedAccountIndex: number;
    selectedAccountType: AddressType;
    selectedTokenName: string;
}

export interface ChangeAccountAction {
    type: typeof CHANGE_ACCOUNT_HASH;
    payload: ChangeAccountType;
}

export interface ShowSignVerifyAction {
    type: typeof SHOW_SIGN_VERIFY;
}

export type AppActionTypes =
    | SetIsLoadingAction
    | LogoutAction
    | SetLedgerAction
    | SetIsLedgerConnectingAction
    | SetWalletIsSyncingAction
    | AddNewVersionAction
    | SetNodesStatusAction
    | UpdateFetchedTimeAction
    | ChangeAccountAction
    | ShowSignVerifyAction
    | SetSignerAction
    | SetBeaconClientAction
    | SetBeaconMessageAction
    | SetBeaconLoadingAction
    | SetLaunchUrlAction;
