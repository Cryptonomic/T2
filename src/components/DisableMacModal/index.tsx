import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import Modal from '../CustomModal';
import { openLink } from '../../utils/general';

import { OkButton, ButtonContainer, ModalDes, Link } from './style';

interface Props {
    open: boolean;
    status: string;
    onClose: () => void;
}

const DisableMacModal = (props: Props) => {
    const { t } = useTranslation();

    const { open, status, onClose } = props;
    const modalTitle = status === 'nft' ? t('components.disableMacModal.nft_title') : t('components.disableMacModal.beacon_title');
    const openLearnMore = () => {
        openLink(
            'https://cryptonomic.zendesk.com/hc/en-us/articles/5868256903053-The-NFT-gallery-and-dapp-interactions-are-unavailable-in-the-App-Store-version-of-Galleon'
        );
    };

    const onGetDes = () => {
        return (
            <Trans i18nKey="components.disableMacModal.nft_description">
                Due to App Store compliance requirements, dapp connectivity and the NFT gallery is not available in the App Store version of Galleon.
                <Link onClick={openLearnMore}>Learn More</Link>
            </Trans>
        );
    };

    return (
        <Modal titleWeight={400} title={modalTitle} open={open} onClose={onClose}>
            <ModalDes>{onGetDes()}</ModalDes>
            <ButtonContainer>
                <OkButton buttonTheme="primary" onClick={() => onClose()}>
                    {t('general.nouns.ok')}
                </OkButton>
            </ButtonContainer>
        </Modal>
    );
};

export default DisableMacModal;
