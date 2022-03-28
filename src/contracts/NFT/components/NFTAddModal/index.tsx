import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useDispatch } from 'react-redux';

import Modal from '../../../../components/CustomModal';

import Loader from '../../../../components/Loader';

import InputAddress from '../../../../components/InputAddress';
import TextField from '../../../../components/TextField';
import { AddButton, AddNFTButtonContainer, InputAddressContainer, ModalHeader } from './style';

interface Props {
    open: boolean;
    onClose: () => void;
}

const NFTAddModal = (props: Props) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const { open, onClose } = props;

    const [NFTContractAddress, setNFTContractAddress] = useState('');
    const [isNFTContractAddressIssue, setIsNFTContractAddressIssue] = useState(false);
    const [isTokenDefinition, setIsTokenDefinition] = useState(false);

    const isDisabled = isNFTContractAddressIssue || !NFTContractAddress;

    return (
        <Modal title={t('components.nftGallery.add_nft')} open={open} onClose={onClose}>
            <ModalHeader>{t('components.nftGallery.add_nft_content')}</ModalHeader>
            <InputAddressContainer>
                <InputAddress
                    label={t('components.nftGallery.nft_contract_address')}
                    operationType="addNFT"
                    onChange={(val) => {
                        setNFTContractAddress(val);
                        setIsTokenDefinition(false);
                    }}
                    onIssue={(flag) => setIsNFTContractAddressIssue(flag)}
                />
            </InputAddressContainer>
            <InputAddressContainer>
                {isTokenDefinition && <TextField label={t('components.nftGallery.collection_name')} value="C00l C0llecti0n" readOnly={true} />}
            </InputAddressContainer>
            <InputAddressContainer>
                {isTokenDefinition && <TextField label={t('components.nftGallery.site_url')} value="obkt.com" readOnly={true} />}
            </InputAddressContainer>

            <AddNFTButtonContainer>
                <AddButton buttonTheme="primary" onClick={() => (isTokenDefinition ? onClose() : setIsTokenDefinition(true))} disabled={isDisabled}>
                    {isTokenDefinition ? t('components.nftGallery.add_nft') : t('general.verbs.continue')}
                </AddButton>
            </AddNFTButtonContainer>
        </Modal>
    );
};

export default NFTAddModal;
