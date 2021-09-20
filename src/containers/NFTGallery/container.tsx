import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { NFT_GALLERY_TABS } from './constants';
import { NFTGalleryTabType } from './types';

import { NFTGallery } from './components';

import { syncWalletThunk } from '../../reduxContent/wallet/thunks';

import { getAccountSelector, AccountSelector } from '../../contracts/duck/selectors';

import { RootState } from '../../types/store';

/**
 * Renders the NFTGallery view allowing to browse and send NFT tokens from integrated sources.
 *
 * @example
 * import NFTGallery from '../containers/NFTGallery';
 *
 * <NFTGallery />
 */
const NFTGalleryContainer = () => {
    const [activeTab, setActiveTab] = useState<NFTGalleryTabType>(NFT_GALLERY_TABS.COLLECTED);

    const { t } = useTranslation();
    const dispatch = useDispatch();

    /**
     * Get the selected account:
     */
    const selectedAccount: AccountSelector = useSelector(getAccountSelector);

    /**
     * Sync the wallet.
     * @todo: Currently it uses `syncWalletThunk()` from the wallet thunk to get NFT tokens.
     */
    const { time, isWalletSyncing } = useSelector((state: RootState) => state.app);
    const onSyncWallet = () => dispatch(syncWalletThunk());

    return (
        <NFTGallery
            activeTab={activeTab}
            selectedAccount={selectedAccount}
            isWalletSyncing={isWalletSyncing}
            onSyncWallet={onSyncWallet}
            onChangePageTab={(value) => setActiveTab(value as NFTGalleryTabType)}
            time={time}
        />
    );
};

export default NFTGalleryContainer;
