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
import { loadTokens } from '../../../../utils/wallet';
import { updateTokensAction } from '../../../../reduxContent/wallet/actions';
import { setLocalData } from '../../../../utils/localData';

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
    // const tokens = loadTokens(mainNode.network);

    const [NFTContractAddress, setNFTContractAddress] = useState('');
    const [isNFTContractAddressIssue, setIsNFTContractAddressIssue] = useState(false);
    const [isTokenDefinition, setIsTokenDefinition] = useState<any>();
    const [isLoading, setIsLoading] = useState(false);
    const [helpLink, setHelpLink] = useState('');
    const [displayName, setDisplayName] = useState('');

    const isDisabled = isNFTContractAddressIssue || !NFTContractAddress || isLoading;

    const parseContractAddress = async () => {
        setIsLoading(true);
        const tokenDefinition = await parseObjktContract(tezosUrl, NFTContractAddress);
        setIsTokenDefinition(tokenDefinition);
        console.log('tokenDefinition', tokenDefinition);
    };

    const addNFT = async () => {
        // TODO write NFT to file after confirmation.
        tokens.push(isTokenDefinition);
        setLocalData('token', isTokenDefinition);
        dispatch(updateTokensAction([...tokens]));
        onClose();
        console.log('tokens', tokens);
    };

    useEffect(() => {
        if (isTokenDefinition && !isTokenDefinition.displayHelpLink) {
            isTokenDefinition.displayHelpLink = helpLink;
        }
        if (isTokenDefinition && !isTokenDefinition.displayName) {
            isTokenDefinition.displayName = displayName;
        }
        return () => {
            setHelpLink('');
            setDisplayName('');
        };
    }, [isTokenDefinition]);

    useEffect(() => {
        setIsLoading(false);
    }, [isTokenDefinition]);

    // KT1LjmAdYQCLBjwv4S2oFkEzyHVkomAf5MrW

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
                {isTokenDefinition && <SuccessText> NFT Contract found!! </SuccessText>}
            </InputAddressContainer>
            {isLoading && <Loader />}
            <InputAddressContainer>
                {isTokenDefinition && (
                    <TextField
                        label={t('components.nftGallery.collection_name')}
                        value={isTokenDefinition.displayName ? isTokenDefinition.displayName : displayName}
                        readOnly={isTokenDefinition.displayName && true}
                        onChange={(val) => {
                            setDisplayName(val);
                        }}
                    />
                )}
            </InputAddressContainer>
            <InputAddressContainer>
                {isTokenDefinition && (
                    <TextField
                        label={t('components.nftGallery.site_url')}
                        value={isTokenDefinition.displayHelpLink ? isTokenDefinition.displayHelpLink : helpLink}
                        readOnly={isTokenDefinition.displayHelpLink && true}
                        onChange={(val) => {
                            setHelpLink(val);
                        }}
                    />
                )}
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
