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
import { updateTokensAction } from '../../../../reduxContent/wallet/actions';
import { endNFTSyncAction } from '../../../../reduxContent/nft/actions';
import { setLocalData, getLocalData } from '../../../../utils/localData';

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

    const tokens = useSelector((state: RootState) => state.wallet.tokens, shallowEqual);
    const customNftToken = getLocalData('token');

    const [NFTContractAddress, setNFTContractAddress] = useState('');
    const [isNFTContractAddressIssue, setIsNFTContractAddressIssue] = useState(false);
    const [tokenDefinition, setTokenDefinition] = useState<any>();
    const [isLoading, setIsLoading] = useState(false);
    const [helpLink, setHelpLink] = useState('');
    const [displayName, setDisplayName] = useState('');

    const isDisabled = isNFTContractAddressIssue || !NFTContractAddress || isLoading;

    const parseContractAddress = async () => {
        setIsLoading(true);
        const tokenDetails = await parseObjktContract(tezosUrl, NFTContractAddress);
        setTokenDefinition(tokenDetails);
    };

    const addNFT = async () => {
        if (tokenDefinition && !tokenDefinition.displayHelpLink) {
            tokenDefinition.displayHelpLink = helpLink;
        }

        if (tokenDefinition && !tokenDefinition.displayName) {
            tokenDefinition.displayName = displayName;
        }

        if (customNftToken) {
            const filteredTokens = customNftToken.filter((ct) => ct.address !== tokenDefinition.address);
            filteredTokens.push(tokenDefinition);

            setLocalData('token', [...filteredTokens]);
        } else {
            setLocalData('token', [tokenDefinition]);
        }

        dispatch(updateTokensAction([...tokens, tokenDefinition]));
        dispatch(endNFTSyncAction(null));

        onClose();
    };

    console.log('customNftToken', customNftToken);

    useEffect(() => {
        setIsLoading(false);
    }, [tokenDefinition]);

    return (
        <Modal title={t('components.nftGallery.add_nft')} open={open} onClose={onClose}>
            <ModalHeader>{t('components.nftGallery.add_nft_content')}</ModalHeader>
            <InputAddressContainer>
                <InputAddress
                    label={t('components.nftGallery.nft_contract_address')}
                    operationType="addNFT"
                    onChange={(val) => {
                        setNFTContractAddress(val);
                        setTokenDefinition(false);
                    }}
                    onIssue={(flag) => setIsNFTContractAddressIssue(flag)}
                />
                {tokenDefinition && <SuccessText> NFT Contract found! </SuccessText>}
            </InputAddressContainer>
            {isLoading && <Loader />}
            <InputAddressContainer>
                {tokenDefinition && (
                    <TextField
                        label={t('components.nftGallery.collection_name')}
                        value={tokenDefinition.displayName ? tokenDefinition.displayName : displayName}
                        readOnly={tokenDefinition.displayName && true}
                        onChange={(val) => {
                            setDisplayName(val);
                        }}
                    />
                )}
            </InputAddressContainer>
            <InputAddressContainer>
                {tokenDefinition && (
                    <TextField
                        label={t('components.nftGallery.site_url')}
                        value={tokenDefinition.displayHelpLink ? tokenDefinition.displayHelpLink : helpLink}
                        readOnly={tokenDefinition.displayHelpLink && true}
                        onChange={(val) => {
                            setHelpLink(val);
                        }}
                    />
                )}
            </InputAddressContainer>
            <AddNFTButtonContainer>
                <AddButton buttonTheme="primary" onClick={() => (tokenDefinition ? addNFT() : parseContractAddress())} disabled={isDisabled}>
                    {tokenDefinition ? t('components.nftGallery.add_nft') : t('general.verbs.continue')}
                </AddButton>
            </AddNFTButtonContainer>
        </Modal>
    );
};

export default NFTAddModal;
