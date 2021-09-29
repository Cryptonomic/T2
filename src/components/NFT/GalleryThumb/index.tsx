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
            {provider ? (
                <ImageFailedBottom>
                    <ImageFailedLink onClick={() => openLink(url)}>
                        {t('components.image.view_on', { provider })}
                        <LinkIcon />
                    </ImageFailedLink>
                </ImageFailedBottom>
            ) : null}
        </ImageFailed>
    );
};

/**
 * The thumb of the NFT asset.
 *
 * The component is used with the Gallery component.
 *
 * @param {NFTObject} nftObject - the NFT object.
 * @param {(nftObject: NFTObject) => void} [onClick] - when user clicks on the thumb title.
 */
export const GalleryThumb: FunctionComponent<GalleryThumbProps> = ({ nftObject, onClick }) => {
    const { t } = useTranslation();

    const { objectId, action, name, description, price, amount, receivedOn, artifactUrl, artifactType, creators, provider } = nftObject;

    const displayAddress = `${creators.slice(0, 6)}...${creators.slice(creators.length - 3, creators.length)}`;

    const failedMedia = <ImageFailedBox provider={provider} url={'https://google.com'} />;

    return (
        <ThumbContainer>
            {artifactUrl ? <ImageStyled src={artifactUrl} alt={name || ''} ImageFailedBox={failedMedia} /> : { failedMedia }}
            <TopRow onClick={() => onClick(nftObject)}>
                <Title>{name}</Title>
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
