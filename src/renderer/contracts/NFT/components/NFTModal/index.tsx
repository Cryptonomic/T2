import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';

import { CloseButton, StyledModalBox, StyledTabMenu } from './style';

import { NFT_MODAL_TABS } from '../../constants';
import { ModalWrapper } from '../../../components/style';
import { NFTModalProps, NFTModalTabType } from '../../types';

import { NFTMoreInfo } from '../NFTMoreInfo';
import { NFTSend } from '../NFTSend';

import { Tab, TabText, TAB_SIZES } from '../../../../components/TabMenu';
import TabPanel from '../../../../components/TabPanel';

/**
 * Renders the modal showing the NFT object details and allowing to send the token.
 * The modal is open if the "nftObject" is set.
 *
 * @param {NFTObject} [nftObject] - the NFT object with all details.
 * @param {() => void} [onClose] - on modal close.
 */
export const NFTModal: FunctionComponent<NFTModalProps> = ({ nftObject, onClose }) => {
    const { t } = useTranslation();

    const [activeTab, setActiveTab] = useState<NFTModalTabType>(NFT_MODAL_TABS.MORE_INFO);

    /**
     * Close the modal
     */
    const onModalClose = (_event, _reason) => {
        onClose();
    };

    /**
     * Build the modal tabs options:
     */
    const tabs = Object.keys(NFT_MODAL_TABS).map((tab) => ({ value: tab, label: t(`components.nftGallery.modal.tabs.${tab.toLowerCase()}`) }));

    return (
        <ModalWrapper open={!!nftObject} onClose={onModalClose} aria-labelledby="NFT Object details." aria-describedby="See NFT object details and send token.">
            <StyledModalBox>
                <StyledTabMenu count={2}>
                    {tabs.map((tab, index) => (
                        <Tab
                            key={`nft-modal-tab-${index}`}
                            isActive={activeTab === tab.value}
                            ready={true}
                            buttonTheme="plain"
                            size={TAB_SIZES.LG}
                            onClick={() => setActiveTab(tab.value as NFTModalTabType)}
                        >
                            <TabText ready={true}>{tab.label}</TabText>
                        </Tab>
                    ))}
                </StyledTabMenu>
                <CloseButton onClick={onClose}>
                    <CloseIcon />
                </CloseButton>

                <TabPanel index={NFT_MODAL_TABS.MORE_INFO} value={activeTab}>
                    <NFTMoreInfo nftObject={nftObject} />
                </TabPanel>

                <TabPanel index={NFT_MODAL_TABS.SEND} value={activeTab}>
                    <NFTSend nftObject={nftObject} closeModal={onClose} />
                </TabPanel>
            </StyledModalBox>
        </ModalWrapper>
    );
};
