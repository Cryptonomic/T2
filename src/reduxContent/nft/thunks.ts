import { clearGetNFTCollectionsErrorAction, startNFTSyncAction, endNFTSyncAction, setNFTCollectionsAction, setNFTCollectionsAreLoadingAction } from './actions';

import { getNFTCollections } from '../../contracts/NFT/util';

import { ArtToken, TokenKind } from '../../types/general';
import { NFTState } from '../../types/store';
import { NFTCollections } from '../../contracts/NFT/types';

import { getMainNode } from '../../utils/settings';
import { syncTokenThunk, syncWalletThunk } from '../wallet/thunks';

const NFT_SYNC_INTERVAL = 600_000; // [ms]

/**
 * Sync the wallet, then NFT collections and tokens.
 */
export const syncNFTAndWalletThunk = () => async (dispatch) => {
    dispatch(clearGetNFTCollectionsErrorAction());
    dispatch(syncNFTThunk(true));
};

/**
 * Sync NFT collections and tokens.
 * It will sync only if a specific time has elapsed since the last sync OR it has not been synced yet at all.
 *
 * Set 'force' to true if you want to force sync.
 *
 * @param {boolean} [force=false] - force the synchronization of NFT collections and tokens.
 */
export const syncNFTThunk = (force: boolean = false) => async (dispatch, getState) => {
    const { lastSyncAt, syncEnabled, isNFTSyncing } = getState().nft as NFTState;

    if (isNFTSyncing) {
        return false;
    }

    const currentTime = new Date();
    const wasRecentlySynced = lastSyncAt && currentTime.getTime() - lastSyncAt.getTime() < NFT_SYNC_INTERVAL;
    if (syncEnabled && wasRecentlySynced && !force) {
        return false;
    }

    dispatch(startNFTSyncAction());

    const collectionsPromise = await dispatch(getCollectionsThunk());
    const tokensPromise = await dispatch(syncNFTTokensDetailsThunk());
    await Promise.all([collectionsPromise, tokensPromise]);

    dispatch(endNFTSyncAction(currentTime));
    return true;
};

/**
 * Get all collections and update the NFT store.
 */
export const getCollectionsThunk = () => async (dispatch, getState) => {
    dispatch(clearGetNFTCollectionsErrorAction());
    dispatch(setNFTCollectionsAreLoadingAction(true));

    const { selectedNode, nodesList } = getState().settings;
    const { selectedParentHash } = getState().app;
    const mainNode = getMainNode(nodesList, selectedNode);
    const tokens = getState().wallet.tokens.filter((token) => [TokenKind.objkt].includes(token.kind));
    const { lastSyncAt } = getState().nft as NFTState;

    const { collections, errors } = await getNFTCollections(tokens as ArtToken[], selectedParentHash, mainNode, false, lastSyncAt || undefined);

    if (lastSyncAt) {
        const loaded: NFTCollections = getState().nft.collections;

        collections.collected = collections.collected.concat(loaded.collected);
        collections.minted = collections.minted.concat(loaded.minted);
    }

    dispatch(setNFTCollectionsAction(collections, errors));
    dispatch(setNFTCollectionsAreLoadingAction(false));
};

/**
 * Sync details of NFT tokens and update the wallet state.
 */
export const syncNFTTokensDetailsThunk = () => async (dispatch, getState) => {
    const nftTokens = getState().wallet.tokens.filter((token) => [TokenKind.objkt].includes(token.kind));
    nftTokens.map(async (token) => {
        await dispatch(syncTokenThunk(token.address));
    });
};
