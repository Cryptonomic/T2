import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import {
    ThumbContainer,
    ImageStyled,
    ImageFailedStyled as ImageFailed,
    ImageFailedTop,
    ImageFailedBottom,
    ImageFailedLink,
    LinkIcon,
    TopRow,
    BottomRow,
    Title,
    Address,
    Capitalize,
    TezosIconStyled,
} from './style';
import { GalleryThumbProps, ImageFailedBoxProps } from './types';

import { FailedIcon, FailedMessage } from '../../Image/style';

import { openLink } from '../../../utils/general';

const ImageFailedBox: FunctionComponent<ImageFailedBoxProps> = ({ provider, url }) => {
    const { t } = useTranslation();

    return (
        <ImageFailed>
            <ImageFailedTop>
                <FailedIcon />
                <FailedMessage>{t('components.image.errors.file_cannot_load')}</FailedMessage>
            </ImageFailedTop>
            <ImageFailedBottom>
                <ImageFailedLink onClick={() => openLink(url)}>
                    {t('components.image.view_on', { provider })}
                    <LinkIcon />
                </ImageFailedLink>
            </ImageFailedBottom>
        </ImageFailed>
    );
};

/**
 * The thumb of the NFT asset.
 *
 * The component is used with the Gallery component.
 *
 * @param {string} address - the token address.
 * @param {string} image - the URL for the image.
 * @param {number} price - the asset's price.
 * @param {string} title - the token's title.
 */
export const GalleryThumb: FunctionComponent<GalleryThumbProps> = ({ address, image, price, title }) => {
    const { t } = useTranslation();

    const displayAddress = `${address.slice(0, 6)}...${address.slice(address.length - 3, address.length)}`;

    return (
        <ThumbContainer>
            <ImageStyled src={image} alt={title} ImageFailedBox={<ImageFailedBox provider={'Hic et nunc'} url={'https://google.com'} />} />
            <TopRow>
                <Title>{title}</Title>
                <span>
                    {price}
                    <TezosIconStyled color="black3" iconName="tezos" size="20px" />
                </span>
            </TopRow>
            <BottomRow>
                <Address>
                    <Capitalize>{t('general.prepositions.by')}</Capitalize> {displayAddress}
                </Address>
            </BottomRow>
        </ThumbContainer>
    );
};
