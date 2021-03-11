import {
    SET_WALLET,
    SET_WALLET_FILENAME,
    SET_WALLET_LOCATION,
    SET_PASSWORD,
    SET_IDENTITIES,
    ADD_NEW_IDENTITY,
    UPDATE_IDENTITY,
    UPDATE_TOKENS,
    SetWalletAction,
    SetWalletFileNameAction,
    UpdateWalletLocationAction,
    SetPasswordAction,
    SetIdentitiesAction,
    AddNewIdentityAction,
    UpdateIdentityAction,
    UpdateTokensAction,
} from './types';

import { ArtToken, VaultToken, Token } from '../../types/general';

export function setWalletAction(identities: any[], walletLocation: string, walletFileName: string, walletPassword: string): SetWalletAction {
    const payload = { identities, walletLocation, walletFileName, walletPassword };
    return {
        type: SET_WALLET,
        payload,
    };
}

export function setWalletFileNameAction(walletFileName: string): SetWalletFileNameAction {
    return {
        type: SET_WALLET_FILENAME,
        walletFileName,
    };
}

export function updateWalletLocationAction(walletLocation: string): UpdateWalletLocationAction {
    return {
        type: SET_WALLET_LOCATION,
        walletLocation,
    };
}

export function setPasswordAction(password: string): SetPasswordAction {
    return {
        type: SET_PASSWORD,
        password,
    };
}

export function setIdentitiesAction(identities: any[]): SetIdentitiesAction {
    return {
        type: SET_IDENTITIES,
        identities,
    };
}

export function addNewIdentityAction(identity: any): AddNewIdentityAction {
    return {
        type: ADD_NEW_IDENTITY,
        identity,
    };
}

export function updateIdentityAction(identity: any): UpdateIdentityAction {
    return {
        type: UPDATE_IDENTITY,
        identity,
    };
}

export function updateTokensAction(tokens: (Token | VaultToken | ArtToken)[]): UpdateTokensAction {
    return {
        type: UPDATE_TOKENS,
        tokens,
    };
}
