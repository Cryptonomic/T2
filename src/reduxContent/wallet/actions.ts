import {
  SET_WALLET,
  SET_WALLET_FILENAME,
  SET_WALLET_LOCATION,
  SET_PASSWORD,
  SET_IDENTITIES,
  ADD_NEW_IDENTITY,
  UPDATE_IDENTITY,
  SetWalletAction,
  SetWalletFileNameAction,
  UpdateWalletLocationAction,
  SetPasswordAction,
  SetIdentitiesAction,
  AddNewIdentityAction,
  UpdateIdentityAction
} from './types';

import { WalletState } from '../../types/store';

export function setWalletAction(
  identities: any[],
  walletLocation: string,
  walletFileName: string,
  password: string
): SetWalletAction {
  const payload: WalletState = { identities, walletLocation, walletFileName, password };
  return {
    type: SET_WALLET,
    payload
  };
}

export function setWalletFileNameAction(walletFileName: string): SetWalletFileNameAction {
  return {
    type: SET_WALLET_FILENAME,
    walletFileName
  };
}

export function updateWalletLocationAction(walletLocation: string): UpdateWalletLocationAction {
  return {
    type: SET_WALLET_LOCATION,
    walletLocation
  };
}

export function setPasswordAction(password: string): SetPasswordAction {
  return {
    type: SET_PASSWORD,
    password
  };
}

export function setIdentitiesAction(identities: any[]): SetIdentitiesAction {
  return {
    type: SET_IDENTITIES,
    identities
  };
}

export function addNewIdentityAction(identity: any): AddNewIdentityAction {
  return {
    type: ADD_NEW_IDENTITY,
    identity
  };
}

export function updateIdentityAction(identity: any): UpdateIdentityAction {
  return {
    type: UPDATE_IDENTITY,
    identity
  };
}
