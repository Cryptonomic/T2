import {
    CLEAR_NFT_GET_COLLECTIONS_ERRORS,
    ENABLE_NFT_SYNC,
    START_NFT_SYNC,
    END_NFT_SYNC,
    SET_NFT_COLLECTIONS,
    SET_NFT_COLLECTIONS_ARE_LOADING,
    StartNFTSyncAction,
    EndNFTSyncAction,
    EnableNFTSyncAction,
    ClearGetNFTCollectionsErrorsAction,
    SetNFTCollectionsAreLoadingAction,
    SetNFTCollectionsAction,
} from './types';

import { NFTCollections, NFTError } from '../../contracts/NFT/types';

/**
 * Mark that NFT sync started.
 */
export function startNFTSyncAction(): StartNFTSyncAction {
    return {
        type: START_NFT_SYNC,
    };
}

/**
 * Mark that NFT sync has finished.
 */
export function endNFTSyncAction(timestamp: Date | null): EndNFTSyncAction {
    return {
        type: END_NFT_SYNC,
        payload: { timestamp },
    };
}

/**
 * Set collections and getCollectionErrors.
 * @param {NFTCollections} collections
 * @param {NFTError[]} errors
 */
export function setNFTCollectionsAction(collections: NFTCollections, errors: NFTError[]): SetNFTCollectionsAction {
    return {
        type: SET_NFT_COLLECTIONS,
        payload: {
            collections,
            errors,
        },
    };
}

export function clearNFTCollectionsAction(): SetNFTCollectionsAction {
    return {
        type: SET_NFT_COLLECTIONS,
        payload: {
            collections: { collected: [], minted: [] },
            errors: [],
        },
    };
}

/**
 * Set collections loading status.
 * @param {boolean} loading
 */
export function setNFTCollectionsAreLoadingAction(loading: boolean): SetNFTCollectionsAreLoadingAction {
    return {
        type: SET_NFT_COLLECTIONS_ARE_LOADING,
        payload: { loading },
    };
}

/**
 * Clear getCollections error
 */
export function clearGetNFTCollectionsErrorAction(): ClearGetNFTCollectionsErrorsAction {
    return {
        type: CLEAR_NFT_GET_COLLECTIONS_ERRORS,
    };
}

/**
 * Enable/disable automatic sync of the NFT collections and tokens.
 * @param {boolean} status
 */
export function enableNFTSyncAction(status: boolean): EnableNFTSyncAction {
    return {
        type: ENABLE_NFT_SYNC,
        payload: { status },
    };
}
