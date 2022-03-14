import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import { NFT_ACTION_TYPES } from './constants';
import { NFTObject, NFTGalleryTabType } from './types';

import { NFTGallery } from './components';

import { getAccountSelector, AccountSelector, getNFTTokensSelector } from '../duck/selectors';

import { isReady } from '../../utils/general';

import { syncNFTThunk, syncNFTAndWalletThunk } from '../../reduxContent/nft/thunks';
import { getNFTCollectionsDataSelector } from '../../reduxContent/nft/selectors';
import { clearGetNFTCollectionsErrorAction, enableNFTSyncAction } from '../../reduxContent/nft/actions';

/**
 * Renders the NFTGallery view allowing to browse and send NFT tokens from integrated sources.
 *
 * @example
 * import NFTGallery from '../containers/NFTGallery';
 *
 * <NFTGallery />
 */
const NFTGalleryContainer = () => {
    const dispatch = useDispatch();

    /**
     * Get the selected Account data, collections and tokens.
     */
    const selectedAccount: AccountSelector = useSelector(getAccountSelector);
    const { storeType, status } = selectedAccount;
    const isAddressReady = isReady(status, storeType);
    const { collections, errors, loading, isNFTSyncing, lastSyncAt } = useSelector(getNFTCollectionsDataSelector);
    const tokens = useSelector(getNFTTokensSelector);

    /**
     * Enable background syncing of the NFT tokens and collections and run NFT sync.
     */
    useEffect(() => {
        dispatch(enableNFTSyncAction(true));
        dispatch(syncNFTThunk());
    }, []);

    /**
     * Define the component states.
     */
    const [activeTab, setActiveTab] = useState<NFTGalleryTabType>(NFT_ACTION_TYPES.COLLECTED);
    const [currentNFTObject, setCurrentNFTObject] = useState<NFTObject | undefined | null>(null);

    /**
     * Sync the wallet.
     */
    const onSyncWallet = () => dispatch(syncNFTAndWalletThunk());

    /**
     * Clear errors of the "getNFTCollections" action.
     */
    const clearErrors = () => dispatch(clearGetNFTCollectionsErrorAction());

    return (
        <NFTGallery
            collections={collections}
            tokens={tokens}
            loading={loading || isNFTSyncing}
            errors={errors}
            activeTab={activeTab}
            isWalletSyncing={isNFTSyncing}
            isAddressReady={isAddressReady}
            onSyncWallet={onSyncWallet}
            onChangePageTab={(value) => setActiveTab(value as NFTGalleryTabType)}
            time={lastSyncAt || new Date()}
            currentNFTObject={currentNFTObject}
            setCurrentNFTObject={setCurrentNFTObject}
            clearErrors={clearErrors}
        />
    );
};

export default NFTGalleryContainer;
