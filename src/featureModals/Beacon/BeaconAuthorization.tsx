import React, { useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { BeaconMessageType, OperationResponseInput } from '@airgap/beacon-sdk';
import { BigNumber } from 'bignumber.js';
import { TezosParameterFormat } from 'conseiljs';

import { beaconClient } from './BeaconConnect';

import beaconReq from '../../../resources/imgs/beaconRequest.svg';
import Loader from '../../components/Loader';
import PasswordInput from '../../components/PasswordInput';

import { RootState, ModalState } from '../../types/store';

import { sendTezThunk, getIsImplicitAndEmptyThunk } from '../../contracts/duck/thunks';
import { invokeAddressThunk } from '../../reduxContent/invoke/thunks';
import { setModalOpen } from '../../reduxContent/modal/actions';
import { setBeaconLoading } from '../../reduxContent/app/actions';

import { ModalWrapper, ModalContainer, Container, ButtonContainer, InvokeButton, WhiteBtn, Footer } from '../style';

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

const WrapPassword = styled.div`
    margin-top: 26px;
`;

interface Props {
    open: boolean;
    onClose: () => void;
}

const BeaconAuthorize = ({ open, onClose }: Props) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { settings } = useSelector((rootState: RootState) => rootState, shallowEqual);
    const activeModal = useSelector<RootState, string>((state: RootState) => state.modal.activeModal);
    const modalValues = useSelector<RootState, ModalState>((state) => state.modal.values, shallowEqual);
    const beaconLoading = useSelector((state: RootState) => state.app.beaconLoading);

    const [password, setPassword] = useState('');

    const { id, operationDetails, website, network, appMetadata } = modalValues[activeModal];
    const isContract = String(operationDetails[0].destination).startsWith('KT1'); // TODO: // recognise contract call and simple transaction

    const onAuthorize = async () => {
        try {
            dispatch(setBeaconLoading(true));

            // const requiresBurn = await getIsImplicitAndEmptyThunk(operationDetails[0].destination, settings.nodesList, settings.selectedNode);

            // TODO: validate fee against min
            // TODO: validate burn+amount+fee against balance - 1xtz
            // TODO: validate amount > 0 for
            // TODO: validate destination != self

            /*if (isContract) {
                dispatch(invokeAddressThunk(
                    operationDetails[0].destination,
                    fee, 
                    new BigNumber(operationDetails[0].amount)).dividedBy(1_000_000).toNumber()
                    10_000,
                    500_000,
                    operationDetails[0].parameters.value,
                    password,
                    selectedParentHash,
                    operationDetails[0].parameters.entrypoint,
                    TezosParameterFormat.Micheline));
                TODO: ledger
            } else {
                dispatch(sendTezThunk(password,
                    operationDetails[0].destination,
                    new BigNumber(operationDetails[0].amount)).dividedBy(1_000_000).toNumber(), Math.floor(fee)));
                    // amount as fraction, fee as mutez – Ugh
                TODO: ledger
            }*/

            const response: OperationResponseInput = {
                type: BeaconMessageType.OperationResponse,
                id,
                transactionHash: '', // TODO: add transaction hash
            };
            await beaconClient.respond(response);

            dispatch(setBeaconLoading());
            dispatch(setModalOpen(false, activeModal));
        } catch (e) {
            console.log('BeaconAuthorize error', e);
        }
    };

    return (
        <ModalWrapper open={open}>
            {open ? (
                <ModalContainer>
                    <Container>
                        <div className="modal-holder">
                            <h3>{t('components.Beacon.authorization.title')}</h3>
                            <div>
                                <img src={beaconReq} />
                            </div>
                            <h4>Network: {network.type}</h4>
                            <p className="linkAddress">{website}</p>
                            <p>
                                {appMetadata.name} is requesting to send a transaction of{' '}
                                <strong>{new BigNumber(operationDetails[0].amount).dividedBy(1_000_000).toNumber().toFixed(6)}</strong> <strong>XTZ</strong> to{' '}
                                <strong>{operationDetails[0].destination}</strong> {`${isContract ? 'with the following parameters:' : ' '}`}
                            </p>
                            {isContract && (
                                <div>
                                    {operationDetails[0].parameters.entrypoint && <div>Contract Function: {operationDetails[0].parameters.entrypoint}</div>}
                                    {operationDetails[0].parameters.value && <div>Parameters: {operationDetails[0].parameters.value}</div>}
                                    <p className="subtitleText">To see more parameters, view the operation details below</p>
                                    <p className="fontWeight400">Operations</p>
                                    <textarea className="inputField">{JSON.stringify(operationDetails[0], null, 2)}</textarea>
                                </div>
                            )}
                            <p>Fee</p>
                            <p className="subtitleText">
                                Authorizing will allow this site to carry out this operation for you. Always make sure you trust the sites you interact with.
                            </p>
                            {isContract && (
                                <WrapPassword>
                                    <PasswordInput label={t('general.nouns.wallet_password')} password={password} onChange={(pwd) => setPassword(pwd)} />
                                </WrapPassword>
                            )}
                        </div>
                    </Container>
                    {beaconLoading && <Loader />}
                    <Footer>
                        <ButtonContainer>
                            <WhiteBtn buttonTheme="secondary" onClick={onClose}>
                                {t('general.verbs.cancel')}
                            </WhiteBtn>
                            <InvokeButton buttonTheme="primary" onClick={onAuthorize}>
                                {t('general.verbs.authorize')}
                            </InvokeButton>
                        </ButtonContainer>
                    </Footer>
                </ModalContainer>
            ) : (
                <ModalContainer />
            )}
        </ModalWrapper>
    );
};

export default BeaconAuthorize;
