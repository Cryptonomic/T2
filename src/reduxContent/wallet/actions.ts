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
  ADD_NEW_VERSION,
  SET_IS_LEDGER_CONNECTIONG,
  WALLET_IS_SYNCING,
  SetWalletAction,
  SetIsLoadingAction,
  SetWalletFileNameAction,
  UpdateWalletLocationAction,
  SetPasswordAction,
  SetIdentitiesAction,
  SetNodesStatusAction,
  AddNewIdentityAction,
  UpdateIdentityAction,
  UpdateFetchedTimeAction,
  LogoutAction,
  SetLedgerAction,
  SetIsLedgerConnectingAction,
  SetWalletIsSyncingAction,
  AddNewVersionAction
} from './types';

export function setWallet(wallet: any): SetWalletAction {
  return {
    type: SET_WALLET,
    wallet
  };
}

export function setIsLoading(isLoading: boolean): SetIsLoadingAction {
  return {
    type: SET_IS_LOADING,
    isLoading
  };
}

export function setWalletFileName(walletFileName: string): SetWalletFileNameAction {
  return {
    type: SET_WALLET_FILENAME,
    walletFileName
  };
}

export function updateWalletLocation(walletLocation: string): UpdateWalletLocationAction {
  return {
    type: SET_WALLET_LOCATION,
    walletLocation
  };
}

export function setPassword(password: string): SetPasswordAction {
  return {
    type: SET_PASSWORD,
    password
  };
}

export function setIdentities(identities: any[]): SetIdentitiesAction {
  return {
    type: SET_IDENTITIES,
    identities
  };
}

export function setNodesStatus(nodesStatus: any): SetNodesStatusAction {
  return {
    type: SET_NODES_STATUS,
    nodesStatus
  };
}

export function addNewIdentity(identity: any): AddNewIdentityAction {
  return {
    type: ADD_NEW_IDENTITY,
    identity
  };
}

export function updateIdentity(identity: any): UpdateIdentityAction {
  return {
    type: UPDATE_IDENTITY,
    identity
  };
}

export function updateFetchedTime(time: any): UpdateFetchedTimeAction {
  return {
    type: UPDATE_FETCHED_TIME,
    time
  };
}

export function logout(): LogoutAction {
  return {
    type: LOGOUT
  };
}

export function setLedger(isLedger: boolean): SetLedgerAction {
  return {
    type: SET_LEDGER,
    isLedger
  };
}

export function setIsLedgerConnecting(isLedgerConnecting: boolean): SetIsLedgerConnectingAction {
  return {
    type: SET_IS_LEDGER_CONNECTIONG,
    isLedgerConnecting
  };
}

export function setWalletIsSyncing(isWalletSyncing: boolean): SetWalletIsSyncingAction {
  return {
    type: WALLET_IS_SYNCING,
    isWalletSyncing
  };
}

export function addNewVersion(newVersion: string): AddNewVersionAction {
  return {
    type: ADD_NEW_VERSION,
    newVersion
  };
}
