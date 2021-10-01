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

    const { name, price, artifactUrl, artifactType, creators, provider } = nftObject;

    const displayAddress = `${creators.slice(0, 6)}...${creators.slice(creators.length - 3, creators.length)}`;

    return (
        <ThumbContainer>
            <MediaStyled source={artifactUrl || ''} type={artifactType} alt={name || ''} enablePreview={false} useNFTFailedBox={true} nftProvider={provider} />
            <TopRow onClick={() => onClick(nftObject)}>
                <Title>{name}</Title>
                <span>
                    {formatAmount(price, 2)}
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