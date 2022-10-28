import { Identity, VaultToken, Token, ArtToken } from '../../types/general';

export const SET_WALLET = 'SET_WALLET';
export const SET_WALLET_FILENAME = 'SET_WALLET_FILENAME';
export const SET_WALLET_LOCATION = 'SET_WALLET_LOCATION';
export const SET_PASSWORD = 'SET_PASSWORD';
export const SET_IDENTITIES = 'SET_IDENTITIES';
export const ADD_NEW_IDENTITY = 'ADD_NEW_IDENTITY';
export const UPDATE_IDENTITY = 'UPDATE_IDENTITY';
export const UPDATE_TOKENS = 'UPDATE_TOKENS';
export const UPDATE_OVENS = 'UPDATE_OVENS';

export interface InitWallet {
    identities: Identity[];
    walletFileName: string;
    walletLocation: string;
    walletPassword: string;
}

export interface SetWalletAction {
    type: typeof SET_WALLET;
    payload: InitWallet;
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

export interface AddNewIdentityAction {
    type: typeof ADD_NEW_IDENTITY;
    identity: any;
}

export interface UpdateIdentityAction {
    type: typeof UPDATE_IDENTITY;
    identity: any;
}

export interface UpdateTokensAction {
    type: typeof UPDATE_TOKENS;
    tokens: (VaultToken | Token | ArtToken)[];
}

export type WalletActionTypes =
    | SetWalletAction
    | SetWalletFileNameAction
    | UpdateWalletLocationAction
    | SetPasswordAction
    | SetIdentitiesAction
    | AddNewIdentityAction
    | UpdateIdentityAction
    | UpdateTokensAction;
