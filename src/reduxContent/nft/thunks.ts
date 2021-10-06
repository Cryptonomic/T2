import { clearGetNFTCollectionsErrorAction, startNFTSyncAction, endNFTSyncAction, setNFTCollectionsAction, setNFTCollectionsAreLoadingAction } from './actions';

import { getNFTCollections } from '../../contracts/NFT/util';

import { TokenKind } from '../../types/general';
import { NFTState } from '../../types/store';

import { getMainNode } from '../../utils/settings';
import { syncTokenThunk, syncWalletThunk } from '../wallet/thunks';

const NFT_SYNC_INTERVAL = 600_000; // [ms]

/**
 * Sync the wallet, then NFT collections and tokens.
 */
export const syncNFTAndWalletThunk = () => async (dispatch) => {
    dispatch(clearGetNFTCollectionsErrorAction());
    dispatch(startNFTSyncAction());
    await dispatch(syncWalletThunk());
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
    // Check if not forced and a given time has elapsed since the last sync
    const { lastSyncAt, syncEnabled } = getState().nft as NFTState;
    const currentTime = new Date();
    const wasRecentlySynced = lastSyncAt && currentTime.getTime() - lastSyncAt.getTime() < NFT_SYNC_INTERVAL;
    if (syncEnabled && wasRecentlySynced && !force) {
        return false;
    }

    // Mark that the sync started:
    dispatch(startNFTSyncAction());

    // Get collections and token configs:
    const collectionsPromise = await dispatch(getCollectionsThunk());
    const tokensPromise = await dispatch(syncNFTTokensDetailsThunk());
    await Promise.all([collectionsPromise, tokensPromise]);

    // Mark the end of the sync:
    dispatch(endNFTSyncAction());
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

    const { collections, errors } = await getNFTCollections(tokens, selectedParentHash, mainNode);

    dispatch(setNFTCollectionsAction(collections, errors));
    dispatch(setNFTCollectionsAreLoadingAction(false));
};

/**
 * Sync details of NFT tokens and update the wallet state.
 */
export const syncNFTTokensDetailsThunk = () => async (dispatch, getState) => {
    const nftTokens = getState().wallet.tokens.filter((token) => [TokenKind.objkt].includes(token.kind));
    nftTokens.map(async (token) => {
        console.log('FLAG --- sync token', token.displayName, token.address);
        await dispatch(syncTokenThunk(token.address));
        console.log('FLAG --- sync token end', token.displayName);
    });
    // for (let i=0; i < nftTokens.length; i++ ) {
    //     const token = nftTokens[i];
    //     console.log('FLAG --- sync token', token.displayName, token.address)
    //     await dispatch(syncTokenThunk(token.address));
    //     console.log('FLAG --- sync token end', token.displayName)
    // }
};
