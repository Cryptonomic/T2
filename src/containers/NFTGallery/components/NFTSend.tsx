import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { NFTSendProps } from '../types';

/**
 * The content of the "Send" tab of the NFT modal.
 *
 * @param {NFTObject} [nftObject] - the NFT object with all details.
 */
export const NFTSend: FunctionComponent<NFTSendProps> = ({ nftObject }) => {
    const { t } = useTranslation();

    return (
        <div>
            <h2>Send</h2>
        </div>
    );
};
