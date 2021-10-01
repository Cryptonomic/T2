import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CropFreeIcon from '@material-ui/icons/CropFree';
import CloseIcon from '@material-ui/icons/Close';

import {
    CloseModalButton,
    FailedIcon,
    FailedLinkIcon,
    FailedMessage,
    ImageFailed,
    ImageFailedBottom,
    ImageFailedLink,
    ImageFailedTop,
    MediaContainer,
    ModalBox,
    ModalContainer,
    PreviewHover,
    PreviewIcon,
    StyledImage,
} from './style';
import { MediaProps } from './types';

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
 * @param {boolean} [enablePreview=true] - enable the fullscreen preview.
 * @param {React.ReactElement | JSX.Element} [FailedBox] - the custom failed box.
 * @param {boolean} [useNFTFailedBox] - use the Failed Box containing a link to the resource.
 * @param {string} [nftProvider] - the NFT provider name.
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
}) => {
    const [openPreview, setOpenPreview] = useState(false);

    const TheFailedBox = FailedBox ? FailedBox : useNFTFailedBox ? <NFTFailedBox provider={nftProvider || ''} url={source} /> : <MediaFailedBox />;

    const renderImage = () => <StyledImage src={source} alt={alt || ''} ImageFailedBox={TheFailedBox} />;

    const renderContent = () => {
        if (/image|png|jpg|jpeg|gif|svg/.test(type.toLowerCase())) {
            return renderImage();
        }

        return renderImage();
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
                {renderContent()}
                <CloseModalButton onClick={() => setOpenPreview(false)}>
                    <CloseIcon />
                </CloseModalButton>
            </ModalBox>
        </ModalContainer>
    );

    return (
        <MediaContainer className={className}>
            {renderContent()}
            {enablePreview ? renderPreviewControls() : null}
            {enablePreview && openPreview ? renderPreview() : null}
        </MediaContainer>
    );
};

export default Media;
export { MediaProps };
