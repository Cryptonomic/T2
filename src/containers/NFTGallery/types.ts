import { NFT_GALLERY_TABS } from './constants';

import { AccountSelector } from '../../contracts/duck/selectors';

/**
 * The type of the tabs in the NFTGallery page.
 */
export type NFTGalleryTabType = typeof NFT_GALLERY_TABS[keyof typeof NFT_GALLERY_TABS];

/**
 * The interface of the NFTGallery.
 */
export interface NFTGalleryProps {
    activeTab: typeof NFT_GALLERY_TABS[keyof typeof NFT_GALLERY_TABS];
    selectedAccount: AccountSelector;
    isWalletSyncing: boolean;
    onSyncWallet: () => void;
    onChangePageTab: (value: NFTGalleryTabType) => void;
    time: Date;
}
