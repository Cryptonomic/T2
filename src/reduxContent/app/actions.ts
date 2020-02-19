import {
  SET_IS_LOADING,
  LOGOUT,
  SET_LEDGER,
  ADD_NEW_VERSION,
  SET_IS_LEDGER_CONNECTIONG,
  WALLET_IS_SYNCING,
  SET_NODES_STATUS,
  UPDATE_FETCHED_TIME,
  CHANGE_ACCOUNT_HASH,
  SetIsLoadingAction,
  LogoutAction,
  SetLedgerAction,
  SetIsLedgerConnectingAction,
  SetWalletIsSyncingAction,
  AddNewVersionAction,
  SetNodesStatusAction,
  UpdateFetchedTimeAction,
  ChangeAccountAction,
  ChangeAccountType
} from './types';
import { NodeStatus, AddressType } from '../../types/general';

export function setIsLoadingAction(isLoading: boolean): SetIsLoadingAction {
  return {
    type: SET_IS_LOADING,
    isLoading
  };
}

export function logoutAction(): LogoutAction {
  return {
    type: LOGOUT
  };
}

export function setLedgerAction(isLedger: boolean): SetLedgerAction {
  return {
    type: SET_LEDGER,
    isLedger
  };
}

export function setIsLedgerConnectingAction(
  isLedgerConnecting: boolean
): SetIsLedgerConnectingAction {
  return {
    type: SET_IS_LEDGER_CONNECTIONG,
    isLedgerConnecting
  };
}

export function setWalletIsSyncingAction(isWalletSyncing: boolean): SetWalletIsSyncingAction {
  return {
    type: WALLET_IS_SYNCING,
    isWalletSyncing
  };
}

export function addNewVersionAction(newVersion: string): AddNewVersionAction {
  return {
    type: ADD_NEW_VERSION,
    newVersion
  };
}

export function setNodesStatusAction(nodesStatus: NodeStatus): SetNodesStatusAction {
  return {
    type: SET_NODES_STATUS,
    nodesStatus
  };
}

export function updateFetchedTimeAction(time: any): UpdateFetchedTimeAction {
  return {
    type: UPDATE_FETCHED_TIME,
    time
  };
}

export function changeAccountAction(
  accountHash: string,
  parentHash: string,
  accountIndex: number,
  parentIndex: number,
  accountType: AddressType
): ChangeAccountAction {
  const payload: ChangeAccountType = {
    selectedAccountHash: accountHash,
    selectedParentHash: parentHash,
    selectedParentIndex: parentIndex,
    selectedAccountIndex: accountIndex,
    selectedAccountType: accountType
  };
  return { type: CHANGE_ACCOUNT_HASH, payload };
}
