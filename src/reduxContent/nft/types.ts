import { NFTCollections, NFTError } from '../../contracts/NFT/types';

export const CLEAR_NFT_GET_COLLECTIONS_ERRORS = 'CLEAR_NFT_GET_COLLECTIONS_ERRORS';
export const ENABLE_NFT_SYNC = 'ENABLE_NFT_SYNC';
export const START_NFT_SYNC = 'START_NFT_SYNC';
export const END_NFT_SYNC = 'END_NFT_SYNC';
export const SET_NFT_COLLECTIONS = 'SET_NFT_COLLECTIONS';
export const SET_NFT_COLLECTIONS_ARE_LOADING = 'SET_NFT_COLLECTIONS_ARE_LOADING';

export interface ClearGetNFTCollectionsErrorsAction {
    type: typeof CLEAR_NFT_GET_COLLECTIONS_ERRORS;
}

export interface StartNFTSyncAction {
    type: typeof START_NFT_SYNC;
}

export interface EndNFTSyncAction {
    type: typeof END_NFT_SYNC;
    payload: {
        timestamp: Date | null;
    };
}

export interface SetNFTCollectionsAction {
    type: typeof SET_NFT_COLLECTIONS;
    payload: {
        collections: NFTCollections;
        errors: NFTError[];
    };
}

export interface SetNFTCollectionsAreLoadingAction {
    type: typeof SET_NFT_COLLECTIONS_ARE_LOADING;
    payload: {
        loading: boolean;
    };
}

export interface EnableNFTSyncAction {
    type: typeof ENABLE_NFT_SYNC;
    payload: {
        status: boolean;
    };
}

export interface GetNFTCollectionsDataSelector {
    collections: NFTCollections;
    errors: NFTError[];
    loading: boolean;
    lastSyncAt: Date | null;
    isNFTSyncing: boolean;
}

export type NFTActionTypes =
    | ClearGetNFTCollectionsErrorsAction
    | EnableNFTSyncAction
    | StartNFTSyncAction
    | EndNFTSyncAction
    | SetNFTCollectionsAction
    | SetNFTCollectionsAreLoadingAction;
