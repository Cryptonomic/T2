/**
 * The Page Banner interface.
 */
export interface PageBannerProps {
    breadcrumbs?: string;
    isAddressReady: boolean;
    isWalletSyncing: boolean;
    onClickLink?: () => void;
    linkText?: string;
    onSyncWallet?: () => void;
    time: Date;
    title?: string;
}
