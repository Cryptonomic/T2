import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AudioIcon from '@mui/icons-material/MusicNote';
import CropFreeIcon from '@mui/icons-material/CropFree';
import CloseIcon from '@mui/icons-material/Close';
import VideoIcon from '@mui/icons-material/PlayArrow';

import {
    StyledAudio,
    CloseModalButton,
    FailedIcon,
    FailedLinkIcon,
    FailedMessage,
    ImageFailed,
    ImageFailedBottom,
    ImageFailedLink,
    ImageFailedTop,
    MediaContainer,
    MediaTypeIconBadge,
    MediaTypeIconWrapper,
    ModalBox,
    ModalContainer,
    PreviewHover,
    PreviewIcon,
    StyledImage,
    StyledVideo,
} from './style';
import { MediaProps, MediaElementProps } from './types';

import { openLink } from '../../utils/general';

/**
 * Basic failed box rendered on the image load error.
 */
const MediaFailedBox: FunctionComponent = () => {
    const { t } = useTranslation();

    return (
        <ImageFailed>
            <ImageFailedTop>
                <FailedIcon />
                <FailedMessage>{t('components.image.errors.file_cannot_load')}</FailedMessage>
            </ImageFailedTop>
        </ImageFailed>
    );
};

/**
 * The failed box containing a link to the image.
 */
const NFTFailedBox: FunctionComponent<{ provider: string; url: string }> = ({ provider, url }) => {
    const { t } = useTranslation();

    return (
        <ImageFailed>
            <ImageFailedTop>
                <FailedIcon />
                <FailedMessage>{t('components.image.errors.file_cannot_load')}</FailedMessage>
            </ImageFailedTop>
            <ImageFailedBottom>
                <ImageFailedLink onClick={() => openLink(url)}>
                    {t('components.image.view_on', { provider: t(`components.nftGallery.providers.${provider}`) })}
                    <FailedLinkIcon />
                </ImageFailedLink>
            </ImageFailedBottom>
        </ImageFailed>
    );
};

/**
 * Render the media (image, video) thumb with the optional fullscreen preview.
 *
 * @param {string} source - the media URL.
 * @param {string} [type='image'] - the media type, ie. image, image/png.
 * @param {string} [alt] - the alt attribute.
 * @param {MediaTypeIcons} [showMediaTypeIcon] - display a media type badge.
 * @param {boolean} [enablePreview=true] - enable the fullscreen preview.
 * @param {React.ReactElement | JSX.Element} [FailedBox] - the custom failed box.
 * @param {boolean} [useNFTFailedBox] - use the Failed Box containing a link to the resource.
 * @param {string} [nftProvider] - the NFT provider name.
 * @param {MediaElementProps} [thumbProps] - the additional params for the thumb element, like autoplay and controls for the video element.
 * @param {MediaElementProps} [previewProps] - the additional params for the fullscreen preview element, like autoplay and controls for the video element.
 */
const Media: FunctionComponent<MediaProps> = ({
    className = '',
    source,
    type = 'image',
    alt,
    enablePreview = true,
    FailedBox,
    useNFTFailedBox,
    nftProvider,
    thumbProps,
    previewProps,
    showMediaTypeIcon = 'skip-image',
}) => {
    const [openPreview, setOpenPreview] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [loadFailed, setLoadFailed] = useState(false);

    const TheFailedBox = FailedBox ? FailedBox : useNFTFailedBox ? <NFTFailedBox provider={nftProvider || ''} url={source} /> : <MediaFailedBox />;

    const renderImage = (innerProps) => {
        const theSource = (innerProps && innerProps.thumbnailUri) || source;
        return (
            <StyledImage
                src={theSource}
                alt={alt || ''}
                type={type}
                ImageFailedBox={TheFailedBox}
                onLoad={() => setLoaded(true)}
                onError={() => setLoadFailed(true)}
            />
        );
    };

    const renderVideo = (innerProps) => {
        return (
            <StyledVideo
                src={source}
                alt={alt || ''}
                type={type}
                VideoFailedBox={TheFailedBox}
                onLoad={() => setLoaded(true)}
                onError={() => setLoadFailed(true)}
                {...innerProps}
            />
        );
    };

    const renderAudio = (innerProps) => {
        enablePreview = false;
        return (
            <StyledAudio
                src={source}
                alt={alt || ''}
                type={type}
                AudioFailedBox={TheFailedBox}
                onLoad={() => setLoaded(true)}
                onError={() => setLoadFailed(true)}
                controls={true}
                {...innerProps}
            />
        );
    };

    const renderContent = (innerProps) => {
        if (/image|png|jpg|jpeg|gif|svg/.test(type.toLowerCase())) {
            return renderImage(innerProps);
        }

        if (/video|mp4|ogg|webm/.test(type.toLowerCase())) {
            return renderVideo(innerProps);
        }

        if (/audio/.test(type.toLowerCase())) {
            return renderAudio(innerProps);
        }

        return renderImage(innerProps); // TODO: unsupported type placeholder
    };

    const renderPreviewControls = () => (
        <PreviewHover className="preview-hover" onClick={() => setOpenPreview(true)}>
            <PreviewIcon>
                <CropFreeIcon />
            </PreviewIcon>
        </PreviewHover>
    );

    const renderPreview = () => (
        <ModalContainer
            open={openPreview}
            onClose={() => setOpenPreview(false)}
            disableAutoFocus={true}
            disableEnforceFocus={true}
            BackdropProps={{
                className: 'dark-backdrop',
            }}
        >
            <ModalBox>
                {renderContent(previewProps)}
                <CloseModalButton onClick={() => setOpenPreview(false)}>
                    <CloseIcon />
                </CloseModalButton>
            </ModalBox>
        </ModalContainer>
    );

    const renderMediaTypeIcon = () => {
        let icon;

        if (/video|mp4|ogg|webm/.test(type.toLowerCase()) && (showMediaTypeIcon === 'all' || showMediaTypeIcon === 'skip-image')) {
            icon = <VideoIcon fontSize="inherit" />;
        }

        if (/audio|mp3|wav/.test(type.toLowerCase()) && (showMediaTypeIcon === 'all' || showMediaTypeIcon === 'skip-image')) {
            icon = <AudioIcon fontSize="inherit" />;
        }

        if (!icon) {
            return null;
        }

        return (
            <MediaTypeIconWrapper>
                <MediaTypeIconBadge>{icon}</MediaTypeIconBadge>
            </MediaTypeIconWrapper>
        );
    };

    return (
        <MediaContainer className={className}>
            {renderContent(thumbProps)}
            {showMediaTypeIcon && (loaded || loadFailed) ? renderMediaTypeIcon() : null}
            {enablePreview && loaded ? renderPreviewControls() : null}
            {enablePreview && openPreview ? renderPreview() : null}
        </MediaContainer>
    );
};

export default Media;
export { MediaProps, MediaElementProps };
