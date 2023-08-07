import { NFTActionType, NFTProviderType, NFTObject } from '../../types';

export interface GalleryThumbProps {
    nftObject: NFTObject;
    onClick: (nftObject: NFTObject) => void;
}

export interface ImageFailedBoxProps {
    provider?: string;
    url: string;
}
