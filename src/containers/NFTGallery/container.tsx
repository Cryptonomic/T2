import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { NFT_ACTION_TYPES } from './constants';
import { NFTObject, NFTGalleryTabType } from './types';

import { NFTGallery } from './components';

import { syncWalletThunk } from '../../reduxContent/wallet/thunks';
import { getNFTCollections } from './thunks';

import { getAccountSelector, AccountSelector } from '../../contracts/duck/selectors';

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
    const { t } = useTranslation();
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
     * @todo: Currently it uses `syncWalletThunk()` from the wallet thunk to get NFT tokens.
     */
    const onSyncWallet = () => dispatch(syncWalletThunk());

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
