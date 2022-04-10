import React, { FunctionComponent, ReactElement, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { NFT_PAGE_TABS, NFT_PROVIDERS } from '../../constants';
import { LoaderWrapper, TokensCount } from './style';
import { NFTGalleryProps, NFTGalleryTabType, NFTObject } from '../../types';

import { Gallery, GalleryItem } from '../../../../components/Gallery';
import Loader from '../../../../components/Loader';
import { NFTGalleryThumb } from '..';
import { PageBanner, PageBannerRow, TextLink as PageBannerLink } from '../../../../components/PageBanner';
import { TabMenu, Tab, TabText } from '../../../../components/TabMenu';
import TabPanel from '../../../../components/TabPanel';
import { Container } from '../../../components/TabContainer/style';

import { openLink } from '../../../../utils/general';

import { tokensSupportURL } from '../../../../config.json';

import { NFTErrors } from '../NFTErrors';
import { NFTModal } from '../NFTModal';
// import { TokensDetailsModal } from '../../../../components/TokensDetailsModal';
import { ManageNFTsModal } from '../../../../components/ManageNFTsModal';

import SearchIcon from '@mui/icons-material/Search';

import { AddIcon, SearchForm, SearchInput, AddButton } from './style';
import { RowContainer } from '../../../components/style';
import { setModalOpen } from '../../../../reduxContent/modal/actions';

const PER_PAGE = 2;

/**
 * Renders the <NFTGallery /> component with the address bar and the <Gallery /> component.
 *
 * @param {NFTCollections} collections - the NFT objects grouped by the action type (ie. 'collected', 'minted').
 * @param {Token[]} tokens - tokens configswith details.
 * @param {NFTGalleryTabType} activeTab - the currently selected tab (collected, minted, etc.).
 * @param {(value: NFTGalleryTabType) => void} onChangePageTab - trigger when user clicks on the page tab menu item.
 * @param {AccountSelector} selectedAccount - the user's account (getAccountSelector).
 * @param {boolean} isAddressReady - is the address data loaded?
 * @param {boolean} isWalletSyncing - is the wallet syncing?
 * @param {() => void} onSyncWallet - trigger when user clicks on the update icon to sync the wallet.
 * @param {Date} time - displays ToolTip if true.
 * @param {boolean} [loading] - display the loader while collections are being loaded.
 * @param {NFTError[] | null} [errors] - the list of API errors.
 * @param {() => void} [clearErrors] - on clear errors button click.
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
    collections,
    tokens,
    loading,
    errors,
    isWalletSyncing,
    isAddressReady,
    onSyncWallet,
    activeTab,
    onChangePageTab,
    time,
    currentNFTObject,
    setCurrentNFTObject,
    clearErrors,
}): ReactElement => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [showTokensDetailsModal, setShowTokensDetailsModal] = useState(false);
    const [search, setSearch] = useState('');

    const onClickLink = (link: string) => openLink(link);

    /**
     * Build the page tabs options (collected, minted, etc.):
     */
    const pageTabs = Object.keys(NFT_PAGE_TABS).map((tab) => ({ value: tab, label: t(`components.nftGallery.tabs.${tab.toLowerCase()}`) }));

    /**
     * Render the loader until the data is fetched. Then, render Tab Panels for the each tokens group.
     */
    const renderContent = () => {
        if (loading) {
            return (
                <LoaderWrapper>
                    <Loader />
                </LoaderWrapper>
            );
        }

        return pageTabs.map((tab) => {
            const displayTokens = tab.value.toLowerCase() in collections ? collections[tab.value.toLowerCase()] : [];
            const searchTokens = displayTokens.filter((token) => {
                if (search) {
                    const foundToken = (token.name && token.name.toLowerCase().includes(search.toLowerCase())) || token.objectId.toString().includes(search);
                    return foundToken;
                } else {
                    return token;
                }
            });

            return (
                <TabPanel key={`pb-tab-panel-${tab.value}`} index={tab.value} value={activeTab}>
                    <RowContainer>
                        <SearchForm>
                            <SearchInput
                                id="NFT-search-input"
                                placeholder="Search NFT by name, collection or token ID"
                                startAdornment={<SearchIcon style={{ fill: search ? '#000000' : '#BDBDBD' }} />}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                }}
                                value={search}
                            />
                        </SearchForm>
                        <AddButton
                            startIcon={<AddIcon />}
                            onClick={() => dispatch(setModalOpen(true, 'NFTAdd'))}
                            disableRipple={true}
                            style={{ margin: '35px 37px 44px 0' }}
                        >
                            Add NFT
                        </AddButton>
                    </RowContainer>
                    <Gallery
                        cols={1}
                        breakpoints={{
                            sm: {
                                breakpoint: '768px',
                                cols: 2,
                                itempadding: '0 8px',
                            },
                            md: {
                                breakpoint: '991px',
                                cols: 3,
                                itempadding: '0 16px',
                            },
                        }}
                        isEmpty={!displayTokens || displayTokens.length === 0}
                    >
                        {searchTokens.map((token, index) => (
                            <GalleryItem key={`gallery-item-${tab.value}-${index}`}>
                                <NFTGalleryThumb nftObject={token} onClick={(nftObj) => setCurrentNFTObject(nftObj)} />
                            </GalleryItem>
                        ))}
                    </Gallery>
                </TabPanel>
            );
        });
    };

    const collectionsSize = collections.collected.reduce((a, c) => a + c.amount, 0) + collections.minted.reduce((a, c) => a + c.amount, 0);

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
            >
                <PageBannerRow>
                    {isAddressReady ? (
                        <>
                            <TokensCount>{t('components.nftGallery.tokensNumberInfo', { count: collectionsSize })}</TokensCount>
                            <PageBannerLink onClick={() => setShowTokensDetailsModal(true)}>{t('general.verbs.see_more')}</PageBannerLink>
                        </>
                    ) : null}
                </PageBannerRow>
            </PageBanner>
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

            <NFTErrors errors={errors} clearErrors={clearErrors} />

            {renderContent()}

            <NFTModal nftObject={currentNFTObject} onClose={() => setCurrentNFTObject(null)} />

            <ManageNFTsModal open={showTokensDetailsModal} tokens={tokens} onClose={() => setShowTokensDetailsModal(false)} />
        </Container>
    );
};
