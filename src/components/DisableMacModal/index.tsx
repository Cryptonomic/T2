import React from 'react';
import { useTranslation } from 'react-i18next';

import Modal from '../CustomModal';

import { OkButton, ButtonContainer, ModalDes } from './style';

interface Props {
    open: boolean;
    status: string;
    onClose: () => void;
}

const DisableMacModal = (props: Props) => {
    const { t } = useTranslation();

    const { open, status, onClose } = props;
    const modalTitle = status === 'nft' ? t('components.disableMacModal.nft_title') : t('components.disableMacModal.beacon_title');
    const des = status === 'nft' ? t('components.disableMacModal.nft_description') : t('components.disableMacModal.beacon_description');

    return (
        <Modal titleWeight={400} title={modalTitle} open={open} onClose={onClose}>
            <ModalDes>{des}</ModalDes>
            <ButtonContainer>
                <OkButton buttonTheme="primary" onClick={() => onClose()}>
                    {t('general.nouns.ok')}
                </OkButton>
            </ButtonContainer>
        </Modal>
    );
};

export default DisableMacModal;
