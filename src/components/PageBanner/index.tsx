import React, { FunctionComponent } from 'react';

import { PageBannerProps } from './types';
import { PageBanner as PageBannerContainer, PageBannerRow, PageTitle, Breadcrumbs, Link, LinkIcon, TextLink } from './style';

import Update from '../Update';

/**
 * Render the blue banner used on the top of the views.
 * The specific element (ie. breadcrumbs, title, sync button, etc.) is rendered if proper
 * attribute is set in component props.
 *
 * Breadcrumbs:
 * @param {string} [breadcrumbs] - render breacrumbs.
 *
 * The status of loading wallet data:
 * @param {boolean} isAddressReady - is the address loaded in the store?
 * @param {boolean} isWalletSyncing - is wallet syncing?
 *
 * The link opening a resource in antoher view or application:
 * @param {() => void} [onClickLink] - render the link element with a given action.
 * @param {string} [linkText] - the linkt text.
 *
 * Update the wallet data:
 * @param {() => void} [onSyncWallet] - render the <Update /> component and use a given action on click.
 * @param {Date} [time] - the date of the last update
 *
 * Other elements:
 * @param {string} [title] - the page title
 * @param {JSX.Element} [children] - the bottom part of the Page Banner.
 *
 * @example
 * import { AccountSelector } from '../../../contracts/duck/selectors';
 * import { openLink, isReady } from '../../../utils/general';
 * import { tokensSupportURL } from '../../../config.json';
 *
 *
 * const { storeType, status } = selectedAccount;
 * const isAddressReady = isReady(status, storeType);
 *
 * const onClickLink = (link: string) => openLink(link);
 *
 * <PageBanner
 *  isAddressReady={isAddressReady}
 *  isWalletSyncing={isWalletSyncing}
 *  onClickLink={tokensSupportURL ? () => onClickLink(tokensSupportURL) : undefined}
 *  linkText='List a token in Galleon'
 *  onSyncWallet={onSyncWallet}
 *  time={time}
 *  title={t('general.nouns.nft_gallery')}
 * />
 */
const PageBanner: FunctionComponent<PageBannerProps> = ({
    breadcrumbs,
    isAddressReady,
    isWalletSyncing,
    onClickLink,
    linkText = 'List a token in Galleon',
    onSyncWallet,
    time,
    title,
    children,
}) => {
    return (
        <PageBannerContainer>
            <PageBannerRow opacity={isAddressReady ? '1' : '0.5'} justify={breadcrumbs ? 'space-between' : 'flex-end'} lightColor={true}>
                {breadcrumbs && <Breadcrumbs>{breadcrumbs}</Breadcrumbs>}
                {onSyncWallet && (
                    <span style={{ marginRight: '-4px' }}>
                        <Update onClick={onSyncWallet} time={time} isReady={isAddressReady} isWalletSyncing={isWalletSyncing} />
                    </span>
                )}
            </PageBannerRow>
            <PageBannerRow opacity={isAddressReady ? '1' : '0.5'} justify="space-between">
                {title && <PageTitle>{title}</PageTitle>}
                {onClickLink && linkText && (
                    <Link onClick={onClickLink}>
                        {linkText} <LinkIcon />
                    </Link>
                )}
            </PageBannerRow>
            {children}
        </PageBannerContainer>
    );
};

export { PageBanner, PageBannerProps, PageBannerRow, Link, TextLink };
