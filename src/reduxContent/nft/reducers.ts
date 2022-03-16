import { NFTState } from '../../types/store';

import { CLEAR_NFT_GET_COLLECTIONS_ERRORS, ENABLE_NFT_SYNC, START_NFT_SYNC, END_NFT_SYNC, SET_NFT_COLLECTIONS, SET_NFT_COLLECTIONS_ARE_LOADING, NFTActionTypes } from './types';

const defaultState: NFTState = {
    isNFTSyncing: false,
    syncEnabled: false,
    lastSyncAt: null,
    collections: {
        collected: [],
        minted: [],
    },
    collectionsAreLoading: false,
    getCollectionsErrors: [],
};

export function nftReducer(state: NFTState = defaultState, action: NFTActionTypes) {
    switch (action.type) {
        case CLEAR_NFT_GET_COLLECTIONS_ERRORS: {
            return { ...state, getCollectionsErrors: [].slice() };
        }
        case ENABLE_NFT_SYNC: {
            return { ...state, syncEnabled: action.payload.status };
        }
        case START_NFT_SYNC: {
            return { ...state, isNFTSyncing: true };
        }
        case END_NFT_SYNC: {
            return { ...state, isNFTSyncing: false, lastSyncAt: action.payload.timestamp };
        }
        case SET_NFT_COLLECTIONS_ARE_LOADING: {
            return { ...state, collectionsAreLoading: action.payload.loading };
        }
        case SET_NFT_COLLECTIONS: {
            return { ...state, collections: { ...action.payload.collections }, getCollectionsErrors: action.payload.errors.slice() };
        }
        default:
            return state;
    }
}
