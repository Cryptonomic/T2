export type MediaTypeIcons = 'none' | 'skip-image' | 'all';

/**
 * The interface of the additional media element props.
 *
 * @prop {boolean} [autoplay] - autoplay the video
 * @prop {boolean} [controls] - show video controls
 * @prop {boolean} [loop] - loop the video
 * @prop {string} [thumbnailUri] - the source of for the thumbnail
 */
export interface MediaElementProps {
    autoplay?: boolean;
    controls?: boolean;
    loop?: boolean;
    thumbnailUri?: string;
}

/**
 * Media component props
 *
 * @prop {string} [className] - the class name
 * @prop {string} source - the image/video source
 * @prop {string} [type] - the media type (ie. image, mp4)
 * @prop {string} [alt] - the alt attribute
 * @prop {MediaTypeIcons} [showMediaTypeIcon] - display a media type badge.
 * @prop {boolean} [enablePreview] - enable showing media in fullsreen mode.
 * @prop {React.ReactElement | JSX.Element} [FailedBox] - custom failed box.
 * @prop {boolean} [useNFTFailedBox] - use the pre-built failed box for NFT.
 * @prop {string} [nftProvider] - the NFT object host.
 * @prop {MediaElementProps} [thumbProps] - customize media element props, like autoplay and controls of the thumb element.
 * @prop {MediaElementProps} [previewProps] - customize media element props, like autoplay and controls of the fullscreen mode.
 */
export interface MediaProps {
    className?: string;
    source: string;
    type?: string;
    alt?: string;
    showMediaTypeIcon?: MediaTypeIcons;
    enablePreview?: boolean;
    FailedBox?: React.ReactElement | JSX.Element;
    useNFTFailedBox?: boolean;
    nftProvider?: string;
    thumbProps?: MediaElementProps;
    previewProps?: MediaElementProps;
}
