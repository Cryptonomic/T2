import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import { parseObjktContract } from '../../util';
import { getMainNode } from '../../../../utils/settings';
import { RootState } from '../../../../types/store';

import Modal from '../../../../components/CustomModal';

import Loader from '../../../../components/Loader';

import InputAddress from '../../../../components/InputAddress';
import TextField from '../../../../components/TextField';
import { AddButton, AddNFTButtonContainer, InputAddressContainer, ModalHeader, SuccessText } from './style';

interface Props {
    open: boolean;
    onClose: () => void;
}

const NFTAddModal = (props: Props) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const { open, onClose } = props;

    const { selectedNode, nodesList } = useSelector((state: RootState) => state.settings, shallowEqual);
    const mainNode = getMainNode(nodesList, selectedNode);
    const { tezosUrl } = mainNode;

    const [NFTContractAddress, setNFTContractAddress] = useState('');
    const [isNFTContractAddressIssue, setIsNFTContractAddressIssue] = useState(false);
    const [isTokenDefinition, setIsTokenDefinition] = useState<{}>();
    const [isLoading, setIsLoading] = useState(false);

    const isDisabled = isNFTContractAddressIssue || !NFTContractAddress || isLoading;

    const parseContractAddress = async () => {
        setIsLoading(true);
        const tokenDefinition = await parseObjktContract(tezosUrl, NFTContractAddress);
        setIsTokenDefinition(tokenDefinition);
        console.log('tokenDefinition', tokenDefinition);
    };

    const addNFT = () => {
        // TODO write NFT to file after confirmation.
        onClose();
    };

    useEffect(() => {
        setIsLoading(false);
    }, [isTokenDefinition]);

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
                {isTokenDefinition && <SuccessText> NFT Contract found! </SuccessText>}
            </InputAddressContainer>
            {isLoading && <Loader />}
            <InputAddressContainer>
                {isTokenDefinition && <TextField label={t('components.nftGallery.collection_name')} value="C00l C0llecti0n" readOnly={true} />}
            </InputAddressContainer>
            <InputAddressContainer>
                {isTokenDefinition && <TextField label={t('components.nftGallery.site_url')} value="obkt.com" readOnly={true} />}
            </InputAddressContainer>

            <AddNFTButtonContainer>
                <AddButton buttonTheme="primary" onClick={() => (isTokenDefinition ? addNFT() : parseContractAddress())} disabled={isDisabled}>
                    {isTokenDefinition ? t('components.nftGallery.add_nft') : t('general.verbs.continue')}
                </AddButton>
            </AddNFTButtonContainer>
        </Modal>
    );
};

export default NFTAddModal;
