import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { ThumbContainer, MediaStyled, TopRow, BottomRow, Title, Address, Capitalize, TezosIconStyled } from './style';
import { GalleryThumbProps } from './types';

import { formatAmount } from '../../../../utils/currency';

/**
 * The thumb of the NFT asset.
 *
 * The component is used with the Gallery component.
 *
 * @param {NFTObject} nftObject - the NFT object.
 * @param {(nftObject: NFTObject) => void} [onClick] - when user clicks on the thumb title.
 */
export const NFTGalleryThumb: FunctionComponent<GalleryThumbProps> = ({ nftObject, onClick }) => {
    const { t } = useTranslation();

    const { name, price, artifactUrl, artifactType, artifactModerationMessage, creators, provider, thumbnailUri } = nftObject;

    const displayAddress = creators && creators.length > 0 ? `${creators.slice(0, 6)}...${creators.slice(creators.length - 3, creators.length)}` : '';

    return (
        <ThumbContainer onClick={() => onClick(nftObject)}>
            <MediaStyled
                source={thumbnailUri || artifactUrl || ''}
                type={artifactType}
                alt={name || ''}
                thumbProps={{
                    autoplay: false,
                    controls: false,
                    loop: false,
                    thumbnailUri,
                }}
                enablePreview={false}
                previewProps={{
                    autoplay: false,
                    controls: false,
                    loop: false,
                    thumbnailUri,
                }}
                useNFTFailedBox={true}
                nftProvider={provider}
                artifactModerationMessage={artifactModerationMessage}
            />
            <TopRow>
                <Title>{name}</Title>
                <span>
                    {formatAmount(price, 2)}
                    <TezosIconStyled color="black3" iconName="tezos" size="20px" />
                </span>
            </TopRow>
            <BottomRow>
                {displayAddress && (
                    <Address>
                        <Capitalize>{t('general.prepositions.by')}</Capitalize> {displayAddress}
                    </Address>
                )}
            </BottomRow>
        </ThumbContainer>
    );
};
