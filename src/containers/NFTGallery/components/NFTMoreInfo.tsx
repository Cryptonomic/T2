import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { NFTMoreInfoProps } from '../types';

/**
 * The content of the "More info" tab of the NFT modal.
 *
 * @param {NFTObject} [nftObject] - the NFT object with all details.
 */
export const NFTMoreInfo: FunctionComponent<NFTMoreInfoProps> = ({ nftObject }) => {
    const { t } = useTranslation();

    return (
        <div>
            <h2>More details</h2>
        </div>
    );
};
