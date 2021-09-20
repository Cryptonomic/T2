import React, { FunctionComponent, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { NFT_GALLERY_TABS } from '../constants';
import { NFTGalleryProps, NFTGalleryTabType } from '../types';

import { PageBanner } from '../../../components/PageBanner';
import { TabMenu, Tab, TabText } from '../../../components/TabMenu';
import TabPanel from '../../../components/TabPanel';
import { Container } from '../../../contracts/components/TabContainer/style';

import { openLink, isReady } from '../../../utils/general';

import { tokensSupportURL } from '../../../config.json';

/**
 * Renders the <NFTGallery /> component with the address bar and the <Gallery /> component.
 *
 * @param {NFTGalleryTabType} activeTab - the currently selected tab (collected, minted, etc.).
 * @param {(value: NFTGalleryTabType) => void} onChangePageTab - trigger when user clicks on the page tab menu item.
 * @param {AccountSelector} selectedAccount - the user's account (getAccountSelector).
 * @param {boolean} isWalletSyncing - is the wallet syncing?
 * @param {() => void} onSyncWallet - trigger when user clicks on the update icon to sync the wallet.
 * @param {Date} time - displays ToolTip if true
 *
 * @returns {ReactElement} returns <NFTGallery /> component
 *
 * @example
 * import { NFTGallery } from './components';
 *
 * const selectedAccount: AccountSelector = useSelector(getAccountSelector);
 *
 * <NFTGallery
 *   activeTab={'COLLECTED'}
 *   onChangePageTab={(val) => console.log('Set the active page tab to:', val)}
 *   selectedAccount={selectedAccount}
 *   isWalletSyncing={true}
 *   onSyncWallet={() => console.log('Sync the wallet!')}
 *   time={new Date}
 * />
 */
export const NFTGallery: FunctionComponent<NFTGalleryProps> = ({
    selectedAccount,
    isWalletSyncing,
    onSyncWallet,
    activeTab,
    onChangePageTab,
    time,
}): ReactElement => {
    const { t } = useTranslation();

    const { storeType, status } = selectedAccount;
    const isAddressReady = isReady(status, storeType);

    const onClickLink = (link: string) => openLink(link);

    /**
     * Build the page tabs options (collected, minted, etc.):
     */
    const pageTabs = Object.keys(NFT_GALLERY_TABS).map((tab) => ({ value: tab, label: t(`components.nftGallery.tabs.${tab.toLowerCase()}`) }));

    return (
        <Container>
            <PageBanner
                isAddressReady={isAddressReady}
                isWalletSyncing={isWalletSyncing}
                onClickLink={tokensSupportURL ? () => onClickLink(tokensSupportURL) : undefined}
                linkText="List a token in Galleon"
                onSyncWallet={onSyncWallet}
                time={time}
                title={t('general.nouns.nft_gallery')}
            />
            <TabMenu count={pageTabs.length}>
                {pageTabs.map((tab) => {
                    return (
                        <Tab
                            key={`pb-tab-${tab.value}`}
                            isActive={activeTab === tab.value}
                            ready={isAddressReady}
                            buttonTheme="plain"
                            onClick={() => {
                                if (isAddressReady) {
                                    onChangePageTab(tab.value as NFTGalleryTabType);
                                }
                            }}
                        >
                            <TabText ready={isAddressReady}>{tab.label}</TabText>
                        </Tab>
                    );
                })}
            </TabMenu>
            {pageTabs.map((tab) => (
                <TabPanel key={`pb-tab-panel-${tab.value}`} index={tab.value} value={activeTab}>
                    <p>{tab.label}</p>
                </TabPanel>
            ))}
        </Container>
    );
};
