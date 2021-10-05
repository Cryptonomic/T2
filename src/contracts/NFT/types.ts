import { NFT_ACTION_TYPES, NFT_PAGE_TABS, NFT_MODAL_TABS, NFT_PROVIDERS, NFT_ERRORS } from './constants';

/**
 * The type of the tabs in the NFTGallery page.
 */
export type NFTActionType = typeof NFT_ACTION_TYPES[keyof typeof NFT_ACTION_TYPES];

/**
 * The type of the tabs in the NFTGallery page.
 */
export type NFTGalleryTabType = typeof NFT_PAGE_TABS[keyof typeof NFT_PAGE_TABS];

/**
 * The type of the tabs in the NFT Modal.
 */
export type NFTModalTabType = typeof NFT_MODAL_TABS[keyof typeof NFT_MODAL_TABS];

/**
 * The type of the tabs in the NFTGallery page.
 */
export type NFTProviderType = typeof NFT_PROVIDERS[keyof typeof NFT_PROVIDERS];

/**
 * The type of the NFT Error.
 */
export type NFTErrorType = typeof NFT_ERRORS[keyof typeof NFT_ERRORS];

/**
 * The interface of the error's data composed in the thunks and/or utils.
 */
export interface NFTErrorData {
    key: string;
    value?: string;
    translate_value?: string;
}

/**
 * The NFTError composed in the thunks and/or utils.
 */
export interface NFTError {
    code: NFTErrorType;
    data?: NFTErrorData[];
}

/**
 * The NFT object details, stored in the collections.
 */
export interface NFTObject {
    action: NFTActionType;
    objectId: number;
    receivedOn: Date;
    price: number;
    amount: number;
    artifactUrl?: string;
    artifactType?: string;
    thumbnailUri?: string;
    creators?: any;
    author?: string;
    name?: string;
    description?: string;
    provider?: NFTProviderType;
}

/**
 * The interface of grouped collections.
 * Each collection type has own field (ie. collected, minted).
 */
export interface NFTCollections {
    collected: NFTObject[];
    minted: NFTObject[];
}

/**
 * The return data of the util's "get collections".
 */
export interface GetNFTCollections {
    collections: NFTCollections;
    errors: NFTError[] | null;
}

/**
 * The return data of the thunk's "get collections".
 */
export interface GetNFTCollectionResponse {
    collections: NFTCollections;
    loading: boolean;
    errors: NFTError[] | null;
}

/**
 * The interface of the NFTGallery component.
 */
export interface NFTGalleryProps {
    activeTab: NFTGalleryTabType;
    collections: NFTCollections;
    loading?: boolean;
    errors?: NFTError[] | null;
    isAddressReady: boolean;
    isWalletSyncing: boolean;
    onSyncWallet: () => void;
    onChangePageTab: (value: NFTGalleryTabType) => void;
    time: Date;
    currentNFTObject?: NFTObject | null;
    setCurrentNFTObject: (obj: NFTObject | undefined | null) => void;
}

/**
 * The interface of the NFTErrors component.
 */
export interface NFTErrorsProps {
    errors?: NFTError[] | null;
}

/**
 * The NFT modal showing the selected token and allowind to send the token.
 */
export interface NFTModalProps {
    nftObject?: NFTObject | null;
    onClose: () => void;
}

/**
 * The "More info" tab component.
 */
export interface NFTMoreInfoProps {
    nftObject?: NFTObject | null;
}

/**
 * The "Send" tab component.
 */
export interface NFTSendProps {
    nftObject?: NFTObject | null;
    closeModal: () => void;
}
