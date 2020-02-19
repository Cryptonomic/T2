import { NodeStatus, AddressType } from '../../types/general';

export const SET_IS_LOADING = 'SET_IS_LOADING';
export const SET_LEDGER = 'SET_LEDGER';
export const SET_IS_LEDGER_CONNECTIONG = 'SET_IS_LEDGER_CONNECTIONG';
export const WALLET_IS_SYNCING = 'WALLET_IS_SYNCING';
export const ADD_NEW_VERSION = 'ADD_NEW_VERSION';
export const SET_NODES_STATUS = 'SET_NODES_STATUS';
export const UPDATE_FETCHED_TIME = 'UPDATE_FETCHED_TIME';
export const CHANGE_ACCOUNT_HASH = 'CHANGE_ACCOUNT_HASH';
export const LOGOUT = 'LOGOUT';

export interface SetIsLoadingAction {
  type: typeof SET_IS_LOADING;
  isLoading: boolean;
}

export interface LogoutAction {
  type: typeof LOGOUT;
}

export interface SetLedgerAction {
  type: typeof SET_LEDGER;
  isLedger: boolean;
}

export interface SetIsLedgerConnectingAction {
  type: typeof SET_IS_LEDGER_CONNECTIONG;
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

export interface ChangeAccountType {
  selectedAccountHash: string;
  selectedParentHash: string;
  selectedParentIndex: number;
  selectedAccountIndex: number;
  selectedAccountType: AddressType;
}

export interface ChangeAccountAction {
  type: typeof CHANGE_ACCOUNT_HASH;
  payload: ChangeAccountType;
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
  | ChangeAccountAction;
