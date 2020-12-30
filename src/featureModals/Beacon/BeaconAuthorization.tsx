import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';
import { BeaconMessageType, OperationResponseInput } from '@airgap/beacon-sdk';
import IconButton from '@material-ui/core/IconButton';
import { BigNumber } from 'bignumber.js';
import { TezosParameterFormat, OperationKindType } from 'conseiljs';

import { beaconClient } from './BeaconConnect';

import Loader from '../../components/Loader';
import PasswordInput from '../../components/PasswordInput';
import Fees from '../../components/Fees';
import Tooltip from '../../components/Tooltip';
import TezosIcon from '../../components/TezosIcon';
import { ms } from '../../styles/helpers';
import { useFetchFees } from '../../reduxContent/app/thunks';

import { RootState, ModalState } from '../../types/store';

import { sendTezThunk, getIsImplicitAndEmptyThunk } from '../../contracts/duck/thunks';
import { invokeAddressThunk } from '../../reduxContent/invoke/thunks';
import { setModalOpen } from '../../reduxContent/modal/actions';
import { setBeaconLoading } from '../../reduxContent/app/actions';
import { createMessageAction } from '../../reduxContent/message/actions';

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
    margin-top: 3px;
`;

const TooltipContainer = styled.div`
    padding: 10px;
    color: #000;
    font-size: 14px;
    max-width: 312px;
`;

const TooltipTitle = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: ${({ theme: { colors } }) => colors.primary};
`;

const TooltipContent = styled.div`
    margin-top: 8px;
    font-size: 14px;
    line-height: 21px;
    width: 270px;
    font-weight: 300;
    color: ${({ theme: { colors } }) => colors.black};
`;

const BoldSpan = styled.span`
    font-weight: 500;
`;

const defaultState = {
    amount: '',
    fee: 2840,
    total: 0,
    balance: 0,
};

const utez = 1000000;
const GAS = 64250;

interface Props {
    open: boolean;
    managerBalance: number;
    onClose: () => void;
}

const BeaconAuthorize = ({ open, managerBalance, onClose }: Props) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { selectedParentHash } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
    const activeModal = useSelector<RootState, string>((state: RootState) => state.modal.activeModal);
    const modalValues = useSelector<RootState, ModalState>((state) => state.modal.values, shallowEqual);
    const operationHash = useSelector<RootState>((state) => state.message.hash) as string;
    const beaconLoading = useSelector((state: RootState) => state.app.beaconLoading);

    const [password, setPassword] = useState('');
    const [operationState, setOperationState] = useState(defaultState);

    const { newFees, miniFee, isRevealed } = useFetchFees(OperationKindType.Origination, true, true);

    const { id, operationDetails, website, network, appMetadata } = modalValues[activeModal];
    const isContract = String(operationDetails[0].destination).startsWith('KT1'); // TODO: // recognize contract call and simple transaction
    const { destination, amount, parameters } = operationDetails[0];
    const operationParameters = parameters || { value: '{prim: "Unit"}', entrypoint: 'default' };

    const onAuthorize = async () => {
        try {
            dispatch(setBeaconLoading(true));

            // const requiresBurn = await getIsImplicitAndEmptyThunk(operationDetails[0].destination, settings.nodesList, settings.selectedNode);

            // TODO: validate fee against min
            // TODO: validate burn+amount+fee against balance - 1xtz
            // TODO: validate amount > 0 for
            // TODO: validate destination != self

            const formattedAmount = new BigNumber(amount).dividedBy(1_000_000).toString();
            if (isContract) {
                const operationResult = await dispatch(
                    invokeAddressThunk(
                        destination,
                        operationState.fee,
                        formattedAmount,
                        10_000,
                        500_000,
                        JSON.stringify(operationParameters.value),
                        password,
                        selectedParentHash,
                        operationParameters.entrypoint,
                        TezosParameterFormat.Micheline
                    )
                );

                if (!!operationResult) {
                    onClose();
                }

                // TODO: ledger
            } else {
                dispatch(sendTezThunk(password, destination, formattedAmount, operationState.fee));
                // TODO: ledger
            }
        } catch (e) {
            console.log('Transaction.Error', e);
            dispatch(setBeaconLoading(false));
        }
    };

    const updateState = (updatedValues) => {
        setOperationState((prevState) => {
            return { ...prevState, ...updatedValues };
        });
    };

    const changeFee = (newFee) => {
        const newAmount = operationState.amount || '0';
        const numAmount = parseFloat(newAmount) * utez;
        const newTotal = numAmount + newFee + GAS;
        const newBalance = managerBalance - operationState.total;
        updateState({ fee: newFee, total: newTotal, balance: newBalance });
    };

    useEffect(() => {
        if (!operationHash || !beaconLoading) {
            return;
        }
        const sendBeaconResponse = async () => {
            try {
                const response: OperationResponseInput = {
                    type: BeaconMessageType.OperationResponse,
                    id,
                    transactionHash: operationHash,
                };
                await beaconClient.respond(response);

                dispatch(setBeaconLoading());
                dispatch(setModalOpen(false, activeModal));
            } catch (e) {
                dispatch(createMessageAction('Beacon authorization fails', true));
            }
        };

        sendBeaconResponse();
    }, [operationHash, beaconLoading]);

    const renderFeeToolTip = () => {
        return (
            <TooltipContainer>
                <TooltipTitle>{t('components.send.fee_tooltip_title')}</TooltipTitle>
                <TooltipContent>
                    <Trans i18nKey="components.send.fee_tooltip_content">
                        This address is not revealed on the blockchain. We have added
                        <BoldSpan>0.001420 XTZ</BoldSpan> for Public Key Reveal to your regular send operation fee.
                    </Trans>
                </TooltipContent>
            </TooltipContainer>
        );
    };

    return (
        <ModalWrapper open={open}>
            {open ? (
                <ModalContainer>
                    <Container>
                        <div className="modal-holder">
                            {operationDetails.length === 1 && <h3>{t('components.Beacon.authorization.title')}</h3>}
                            {operationDetails.length > 1 && <h3>{t('components.Beacon.authorization.title_plural')}</h3>}
                            <h4>Network: {network.type}</h4>
                            <p className="linkAddress">{website}</p>
                            {!isContract && (
                                <p>
                                    {appMetadata.name} is requesting a transaction of{' '}
                                    <strong>{new BigNumber(operationDetails[0].amount).dividedBy(1_000_000).toNumber().toFixed(6)}</strong>
                                    <strong>XTZ</strong> to <strong>{operationDetails[0].destination}</strong>
                                </p>
                            )}
                            {isContract && (
                                <p>
                                    {appMetadata.name} is requesting a contract call to the <strong>{operationParameters.entrypoint}</strong> function of{' '}
                                    <strong>{operationDetails[0].destination}</strong>
                                    {new BigNumber(operationDetails[0].amount).toNumber() !== 0 && (
                                        <span>
                                            {' '}
                                            with <strong>{new BigNumber(operationDetails[0].amount).dividedBy(1_000_000).toNumber().toFixed(6)}</strong>{' '}
                                            <strong>XTZ</strong> and{' '}
                                        </span>
                                    )}
                                    {new BigNumber(operationDetails[0].amount).toNumber() === 0 && <span> with </span>}
                                    the following parameters: <strong>{JSON.stringify(operationParameters.value)}</strong>
                                </p>
                            )}

                            {isContract && (
                                <div>
                                    <p className="inputLabel">Raw Operation Content</p>
                                    <textarea className="inputField">{JSON.stringify(operationDetails[0], null, 2)}</textarea>
                                </div>
                            )}
                            <div className="feeContainer">
                                <Fees
                                    low={newFees.low}
                                    medium={newFees.medium}
                                    high={newFees.high}
                                    fee={operationState.fee}
                                    miniFee={miniFee}
                                    onChange={changeFee}
                                    tooltip={
                                        !isRevealed ? (
                                            <Tooltip position="bottom" content={renderFeeToolTip()}>
                                                <IconButton size="small">
                                                    <TezosIcon iconName="help" size={ms(1)} color="gray5" />
                                                </IconButton>
                                            </Tooltip>
                                        ) : null
                                    }
                                />
                            </div>
                            <WrapPassword>
                                <PasswordInput label={t('general.nouns.wallet_password')} password={password} onChange={(pwd) => setPassword(pwd)} />
                            </WrapPassword>
                            <p className="subtitleText">
                                Authorizing will allow this site to carry out this operation for you. Always make sure you trust the sites you interact with.
                            </p>
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
