export const SET_WALLET = 'SET_WALLET';
export const SET_IS_LOADING = 'SET_IS_LOADING';
export const SET_WALLET_FILENAME = 'SET_WALLET_FILENAME';
export const SET_WALLET_LOCATION = 'SET_WALLET_LOCATION';
export const SET_PASSWORD = 'SET_PASSWORD';
export const SET_IDENTITIES = 'SET_IDENTITIES';
export const ADD_NEW_IDENTITY = 'ADD_NEW_IDENTITY';
export const UPDATE_IDENTITY = 'UPDATE_IDENTITY';
export const UPDATE_FETCHED_TIME = 'UPDATE_FETCHED_TIME';
export const SET_NODES_STATUS = 'SET_NODES_STATUS';
export const LOGOUT = 'LOGOUT';
export const SET_LEDGER = 'SET_LEDGER';
export const SET_IS_LEDGER_CONNECTIONG = 'SET_IS_LEDGER_CONNECTIONG';
export const WALLET_IS_SYNCING = 'WALLET_IS_SYNCING';
export const ADD_NEW_VERSION = 'ADD_NEW_VERSION';

export interface SetWalletAction {
  type: typeof SET_WALLET;
  wallet: any;
}

export interface SetIsLoadingAction {
  type: typeof SET_IS_LOADING;
  isLoading: boolean;
}

export interface SetWalletFileNameAction {
  type: typeof SET_WALLET_FILENAME;
  walletFileName: string;
}

export interface UpdateWalletLocationAction {
  type: typeof SET_WALLET_LOCATION;
  walletLocation: string;
}

export interface SetPasswordAction {
  type: typeof SET_PASSWORD;
  password: string;
}

export interface SetIdentitiesAction {
  type: typeof SET_IDENTITIES;
  identities: any[];
}

export interface SetNodesStatusAction {
  type: typeof SET_NODES_STATUS;
  nodesStatus: any;
}

export interface AddNewIdentityAction {
  type: typeof ADD_NEW_IDENTITY;
  identity: any;
}

export interface UpdateIdentityAction {
  type: typeof UPDATE_IDENTITY;
  identity: any;
}

export interface UpdateFetchedTimeAction {
  type: typeof UPDATE_FETCHED_TIME;
  time: any;
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

export type WalletActionTypes =
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
  | SetWalletIsSyncingAction
  | AddNewVersionAction;
