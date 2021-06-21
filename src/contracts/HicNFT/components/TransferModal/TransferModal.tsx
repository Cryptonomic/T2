import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { createMessageAction } from '../../../../reduxContent/message/actions';

import Loader from '../../../../components/Loader';
import { RootState, AppState } from '../../../../types/store';
import { AddressInfoLink, ModalWrapper, ModalContainer, CloseIconWrapper, ModalTitle } from '../../../../featureModals/style';

import { LinkIcon } from '../Collection/style';
import { Container, AmountContainer, PasswordContainer, InvokeButton } from './style';

import InputAddress from '../../../../components/InputAddress';
import NumericInput from '../../../../components/NumericInput';
import PasswordInput from '../../../../components/PasswordInput';

import { transferThunk } from '../../thunks';

import { openLink } from '../../../../utils/general';

export const PromptContainer = styled.div`
    align-items: center;
    color: #979797;
    display: flex;
    font-size: 24px;
    justify-content: center;
    height: 80px;
    margin-top: 30px;
    width: 100%;
`;

interface Props {
    open: boolean;
    onClose: () => void;
}

const TransferModal = ({ open, onClose }: Props) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { isLoading, isLedger, selectedAccountHash } = useSelector<RootState, AppState>((state: RootState) => state.app, shallowEqual);
    const { piece } = useSelector<RootState, any>((state: RootState) => state.modal.values, shallowEqual);

    const [passPhrase, setPassPhrase] = useState('');
    const [amount, setAmount] = useState(0);
    const [address, setAddress] = useState('');
    const [issue, setIssue] = useState('');

    const isDisabled = !passPhrase && !isLedger;

    const onTransfer = async () => {
        dispatch(transferThunk(address, amount, piece.objectId, passPhrase));
        onClose();
    };

    const onChangeAddress = (a) => setAddress(a);
    const onIssue = () => setIssue('');
    const onChangeAmount = (n) => setAmount(Number(n));

    return (
        <ModalWrapper open={open}>
            {open ? (
                <ModalContainer>
                    <CloseIconWrapper onClick={() => onClose()} />
                    <ModalTitle>
                        {t('general.verbs.send')} "{piece.info.name}" (OBJKT #{piece.objectId})
                        <AmountContainer>
                            <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>View on hic et nunc</span>
                            <LinkIcon iconName="new-window" color="black" onClick={() => openLink(`https://www.hicetnunc.xyz/objkt/${piece.objectId}`)} />
                        </AmountContainer>
                    </ModalTitle>
                    <Container>
                        {/* TODO: extract values from piece if needed */}
                        <InputAddress
                            label={t('components.hicNFT.modal.recipient_address')}
                            address={selectedAccountHash}
                            operationType="send_babylon" // TODO: add correct operation type
                            onChange={onChangeAddress}
                            onIssue={onIssue}
                        />
                        <AmountContainer>
                            <NumericInput
                                label={t('general.nouns.quantity')}
                                scale={1}
                                precision={0}
                                amount={amount + ''}
                                onChange={onChangeAmount}
                                errorText={''}
                                symbol={'OBJKT'}
                            />
                        </AmountContainer>
                        <PasswordContainer>
                            {!isLedger && (
                                <PasswordInput
                                    label={t('general.nouns.wallet_password')}
                                    password={passPhrase}
                                    onChange={(val) => setPassPhrase(val)}
                                    containerStyle={{ width: '60%', marginTop: '10px' }}
                                />
                            )}
                            <InvokeButton buttonTheme="primary" disabled={isDisabled} onClick={onTransfer}>
                                {t('components.hicNFT.modal.send')}
                            </InvokeButton>
                        </PasswordContainer>
                    </Container>
                    {/* <Loader /> */}
                </ModalContainer>
            ) : (
                <ModalContainer />
            )}
        </ModalWrapper>
    );
};

export default TransferModal;
