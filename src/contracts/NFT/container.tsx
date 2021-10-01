import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { NFT_ACTION_TYPES } from './constants';
import { NFTObject, NFTGalleryTabType } from './types';

import { NFTGallery } from './components';

import { getNFTCollections, syncNFT } from './thunks';

import { getAccountSelector, AccountSelector } from '../duck/selectors';

import { RootState } from '../../types/store';

import { isReady } from '../../utils/general';

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
     * Get the selected Account data and wallet sync status.
     */
    const { time, isWalletSyncing } = useSelector((state: RootState) => state.app);
    const selectedAccount: AccountSelector = useSelector(getAccountSelector);
    const { storeType, status } = selectedAccount;
    const isAddressReady = isReady(status, storeType);

    /**
     * Define the component states.
     */
    const [activeTab, setActiveTab] = useState<NFTGalleryTabType>(NFT_ACTION_TYPES.COLLECTED);
    const [currentNFTObject, setCurrentNFTObject] = useState<NFTObject | undefined | null>(null);

    const { collections, loading, errors } = getNFTCollections();

    /**
     * Sync the wallet.
     */
    const onSyncWallet = () => dispatch(syncNFT());

    return (
        <NFTGallery
            collections={collections}
            loading={loading}
            errors={errors}
            activeTab={activeTab}
            isWalletSyncing={isWalletSyncing}
            isAddressReady={isAddressReady}
            onSyncWallet={onSyncWallet}
            onChangePageTab={(value) => setActiveTab(value as NFTGalleryTabType)}
            time={time}
            currentNFTObject={currentNFTObject}
            setCurrentNFTObject={setCurrentNFTObject}
        />
    );
};

export default NFTGalleryContainer;
