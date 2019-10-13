import { Action, ActionCreator } from 'redux';

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

export interface SetWalletAction extends Action {
  type: 'SET_WALLET';
  wallet: any;
}

export const setWallet: ActionCreator<SetWalletAction> = (wallet: any) => ({
  type: SET_WALLET,
  wallet
});

export interface SetIsLoadingAction extends Action {
  type: 'SET_IS_LOADING';
  isLoading: boolean;
}

export const setIsLoading: ActionCreator<SetIsLoadingAction> = (isLoading: boolean) => ({
  type: SET_IS_LOADING,
  isLoading
});

export interface SetWalletFileNameAction extends Action {
  type: 'SET_WALLET_FILENAME';
  walletFileName: string;
}

export const setWalletFileName: ActionCreator<SetWalletFileNameAction> = (
  walletFileName: string
) => ({
  type: SET_WALLET_FILENAME,
  walletFileName
});

export interface UpdateWalletLocationAction extends Action {
  type: 'SET_WALLET_LOCATION';
  walletLocation: string;
}

export const updateWalletLocation: ActionCreator<UpdateWalletLocationAction> = (
  walletLocation: string
) => ({
  type: SET_WALLET_LOCATION,
  walletLocation
});

export interface SetPasswordAction extends Action {
  type: 'SET_PASSWORD';
  password: string;
}

export const setPassword: ActionCreator<SetPasswordAction> = (password: string) => ({
  type: SET_PASSWORD,
  password
});

export interface SetIdentitiesAction extends Action {
  type: 'SET_IDENTITIES';
  identities: any[];
}

export const setIdentities: ActionCreator<SetIdentitiesAction> = (identities: any[]) => ({
  type: SET_IDENTITIES,
  identities
});

export interface SetNodesStatusAction extends Action {
  type: 'SET_NODES_STATUS';
  nodesStatus: any;
}

export const setNodesStatus: ActionCreator<SetNodesStatusAction> = (nodesStatus: any) => ({
  type: SET_NODES_STATUS,
  nodesStatus
});

export interface AddNewIdentityAction extends Action {
  type: 'ADD_NEW_IDENTITY';
  identity: any;
}

export const addNewIdentity: ActionCreator<AddNewIdentityAction> = (identity: any) => ({
  type: ADD_NEW_IDENTITY,
  identity
});

export interface UpdateIdentityAction extends Action {
  type: 'UPDATE_IDENTITY';
  identity: any;
}

export const updateIdentity: ActionCreator<UpdateIdentityAction> = (identity: any) => ({
  type: UPDATE_IDENTITY,
  identity
});

export interface UpdateFetchedTimeAction extends Action {
  type: 'UPDATE_FETCHED_TIME';
  time: any;
}

export const updateFetchedTime: ActionCreator<UpdateFetchedTimeAction> = (time: any) => ({
  type: UPDATE_FETCHED_TIME,
  time
});

export interface LogoutAction extends Action {
  type: 'LOGOUT';
}

export const logout: ActionCreator<LogoutAction> = () => ({
  type: LOGOUT
});

export interface SetLedgerAction extends Action {
  type: 'SET_LEDGER';
  isLedger: boolean;
}

export const setLedger: ActionCreator<SetLedgerAction> = (isLedger: boolean) => ({
  type: SET_LEDGER,
  isLedger
});

export interface SetIsLedgerConnectingAction extends Action {
  type: 'SET_IS_LEDGER_CONNECTIONG';
  isLedgerConnecting: boolean;
}

export const setIsLedgerConnecting: ActionCreator<SetIsLedgerConnectingAction> = (
  isLedgerConnecting: boolean
) => ({
  type: SET_IS_LEDGER_CONNECTIONG,
  isLedgerConnecting
});

export interface SetWalletIsSyncingAction extends Action {
  type: 'WALLET_IS_SYNCING';
  isWalletSyncing: boolean;
}

export const setWalletIsSyncing: ActionCreator<SetWalletIsSyncingAction> = (
  isWalletSyncing: boolean
) => ({
  type: WALLET_IS_SYNCING,
  isWalletSyncing
});

export type WalletAction =
  | SetWalletAction
  | SetIsLoadingAction
  | SetWalletFileNameAction
  | UpdateWalletLocationAction
  | SetPasswordAction
  | SetIdentitiesAction
  | SetNodesStatusAction
  | AddNewIdentityAction
  | UpdateIdentityAction
  | UpdateFetchedTimeAction
  | LogoutAction
  | SetLedgerAction
  | SetIsLedgerConnectingAction
  | SetWalletIsSyncingAction;
