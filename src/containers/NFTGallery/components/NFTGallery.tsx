import React, { FunctionComponent, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { PageBanner } from '../../../components/PageBanner';
import { Container } from '../../../contracts/components/TabContainer/style';

import { AccountSelector } from '../../../contracts/duck/selectors';

import { openLink, isReady } from '../../../utils/general';

import { tokensSupportURL } from '../../../config.json';

export interface NFTGalleryProps {
    selectedAccount: AccountSelector;
    isWalletSyncing: boolean;
    onSyncWallet: () => void;
    time: Date;
}

/**
 * Renders the <NFTGallery /> component with the address bar and the <Gallery /> component.
 *
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
 *   selectedAccount={selectedAccount}
 *   isWalletSyncing={true}
 *   onSyncWallet={() => console.log('Sync the wallet!')}
 *   time={new Date}
 * />
 */
export const NFTGallery: FunctionComponent<NFTGalleryProps> = ({ selectedAccount, isWalletSyncing, onSyncWallet, time }): ReactElement => {
    const { t } = useTranslation();

    const { storeType, status } = selectedAccount;
    const isAddressReady = isReady(status, storeType);

    const onClickLink = (link: string) => openLink(link);

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
        </Container>
    );
};
