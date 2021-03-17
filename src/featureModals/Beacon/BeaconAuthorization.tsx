import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';
import { BeaconMessageType, OperationResponseInput, BeaconErrorType, BeaconResponseInputMessage } from '@airgap/beacon-sdk';
import { BigNumber } from 'bignumber.js';
import { JSONPath } from 'jsonpath-plus';

import { beaconClient } from './BeaconMessageRouter';

import Loader from '../../components/Loader';
import TezosNumericInput from '../../components/TezosNumericInput';
import PasswordInput from '../../components/PasswordInput';

import { RootState, ModalState } from '../../types/store';
import { formatAmount, tezToUtez } from '../../utils/currency';

import { sendTezThunk } from '../../contracts/duck/thunks';
import { setModalOpen } from '../../reduxContent/modal/actions';
import { setBeaconLoading } from '../../reduxContent/app/actions';
import { createMessageAction } from '../../reduxContent/message/actions';

import { ModalWrapper, ModalContainer, Container, ButtonContainer, InvokeButton, WhiteBtn, Footer } from '../style';
import { knownContractNames, knownMarketMetadata } from '../../constants/Token';

import { estimateOperationGroupFee, sendOperations, queryHicEtNuncSwap } from './thunks';

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

interface Props {
    open: boolean;
    managerBalance: number;
    onClose: () => void;
}

const BeaconAuthorize = ({ open, managerBalance, onClose }: Props) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { selectedParentHash, isLedger } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
    const activeModal = useSelector<RootState, string>((state: RootState) => state.modal.activeModal);
    const modalValues = useSelector<RootState, ModalState>((state) => state.modal.values, shallowEqual);
    const operationHash = useSelector<RootState>((state) => state.message.hash) as string;
    const beaconLoading = useSelector((state: RootState) => state.app.beaconLoading);

    const [password, setPassword] = useState('');
    const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
    const [fee, setFee] = useState('0');
    const [feeError, setFeeError] = useState('');

    const { id, operationDetails, website, network, appMetadata } = modalValues[activeModal];
    const isContract = String(operationDetails[0].destination).startsWith('KT1'); // TODO: // recognize contract call and simple transaction
    const { destination, amount, parameters } = operationDetails[0];
    const operationParameters = parameters || { value: { prim: 'Unit' }, entrypoint: 'default' };

    const estimatedMinimumFee = estimateOperationGroupFee(selectedParentHash, operationDetails);

    const onCancel = async () => {
        try {
            const response: BeaconResponseInputMessage = {
                id,
                type: BeaconMessageType.Error,
                errorType: BeaconErrorType.ABORTED_ERROR,
                // senderId:
            };
            await beaconClient.respond(response);
        } finally {
            onClose();
        }
    };

    const onAuthorize = async () => {
        try {
            dispatch(setBeaconLoading(true));

            // const requiresBurn = await getIsImplicitAndEmptyThunk(operationDetails[0].destination, settings.nodesList, settings.selectedNode);

            // TODO: validate fee against min
            // TODO: validate burn+amount+fee against balance - 1xtz
            // TODO: validate amount > 0
            // TODO: validate amount < managerBalance
            // TODO: validate destination != self

            if (isLedger) {
                setLedgerModalOpen(true);
            }

            const utezFee = tezToUtez(parseFloat(fee));

            if (isContract) {
                // TODO: errors from here don't always bubble up
                const operationResult = await dispatch(sendOperations(password, operationDetails, utezFee));

                if (!!operationResult) {
                    setLedgerModalOpen(false);
                    dispatch(setBeaconLoading(false));
                    onClose();
                } else {
                    // error
                    setLedgerModalOpen(false);
                }
            } else {
                dispatch(sendTezThunk(password, destination, formatAmount(amount), utezFee));
            }
        } catch (e) {
            console.log('Transaction.Error', e);
            dispatch(createMessageAction(e.message || e.toString(), true));
            dispatch(setBeaconLoading(false));
            setLedgerModalOpen(false);
        }
    };

    useEffect(() => {
        setFee(formatAmount(estimatedMinimumFee));
    }, [estimatedMinimumFee]);

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
                dispatch(createMessageAction(`Beacon authorization failed with "${e.message}"`, true));
            }
        };

        sendBeaconResponse();
    }, [operationHash, beaconLoading]);

    const contractName = knownContractNames[operationDetails[0].destination] || operationDetails[0].destination;

    const idTransaction = (transaction) => {
        if (transaction.destination === 'KT1PDrBE59Zmxnb8vXRgRAG1XmvTMTs5EDHU') {
            // Dexter ETHtz Pool
            if (transaction.parameters.entrypoint === 'xtzToToken') {
                const holder = JSONPath({ path: '$.args[0].string', json: transaction.parameters.value })[0];
                const tokenAmount = new BigNumber(JSONPath({ path: '$.args[1].args[0].int', json: transaction.parameters.value })[0])
                    .dividedBy('1000000000000000000')
                    .toFixed();
                const expiration = new Date(JSONPath({ path: '$.args[1].args[1].string', json: transaction.parameters.value })[0]);

                return (
                    <>
                        &nbsp;to receive <strong>{tokenAmount.toString()}</strong> ETHtz at <strong>{holder}</strong>, expiring on{' '}
                        <strong>{expiration.toString()}</strong>
                    </>
                );
            }

            if (transaction.parameters.entrypoint === 'addLiquidity') {
                const holder = JSONPath({ path: '$.args[0].args[0].string', json: transaction.parameters.value })[0];
                // TODO: $.args[0].args[1].int liquidity token balance
                const tokenAmount = new BigNumber(JSONPath({ path: '$.args[1].args[0].int', json: transaction.parameters.value })[0])
                    .dividedBy('1000000000000000000')
                    .toFixed();
                const expiration = new Date(JSONPath({ path: '$.args[1].args[1].string', json: transaction.parameters.value })[0]);

                return (
                    <>
                        &nbsp;to add <strong>{tokenAmount.toString()}</strong> ETHtz to the pool from <strong>{holder}</strong>, expiring on{' '}
                        <strong>{expiration.toString()}</strong>
                    </>
                );
            }

            if (transaction.parameters.entrypoint === 'tokenToToken') {
                const targetToken = JSONPath({ path: '$.args[0].args[0].string', json: transaction.parameters.value })[0];
                // const targetName = knownContractNames[targetToken] || targetToken;
                const targetSymbol = knownMarketMetadata.filter((o) => o.address === targetToken)[0].symbol || 'tokens';
                const targetScale = knownMarketMetadata.filter((o) => o.address === targetToken)[0].scale || 0;
                const targetAmount = new BigNumber(JSONPath({ path: '$.args[0].args[1].args[0].int', json: transaction.parameters.value })[0])
                    .dividedBy(10 ** targetScale)
                    .toFixed();
                const targetHolder = JSONPath({ path: '$.args[0].args[1].args[1].string', json: transaction.parameters.value })[0];
                const sourceHolder = JSONPath({ path: '$.args[1].args[0].string', json: transaction.parameters.value })[0];
                const sourceAmount = new BigNumber(JSONPath({ path: '$.args[1].args[1].args[0].int', json: transaction.parameters.value })[0])
                    .dividedBy('1000000000000000000')
                    .toFixed();
                const expiration = new Date(JSONPath({ path: '$.args[1].args[1].args[1].string', json: transaction.parameters.value })[0]);

                let holderText = '';
                if (targetHolder === sourceHolder) {
                    holderText = `for ${targetHolder}`;
                } else {
                    holderText = `from ${sourceHolder} to ${targetHolder}`;
                }

                return (
                    <>
                        &nbsp;to exchange <strong>{sourceAmount.toString()}</strong> ETHtz for <strong>{targetAmount.toString()}</strong> {targetSymbol}{' '}
                        <strong>{holderText}</strong>, expiring on <strong>{expiration.toString()}</strong>
                    </>
                );
            }

            return undefined;
        }

        if (transaction.destination === 'KT1Tr2eG3eVmPRbymrbU2UppUmKjFPXomGG9') {
            // Dexter USDtz Pool
            if (transaction.parameters.entrypoint === 'xtzToToken') {
                const holder = JSONPath({ path: '$.args[0].string', json: transaction.parameters.value })[0];
                const tokenAmount = new BigNumber(JSONPath({ path: '$.args[1].args[0].int', json: transaction.parameters.value })[0])
                    .dividedBy('1000000')
                    .toFixed();
                const expiration = new Date(JSONPath({ path: '$.args[1].args[1].string', json: transaction.parameters.value })[0]);

                return (
                    <>
                        &nbsp;to receive <strong>{tokenAmount.toString()}</strong> USDtz at <strong>{holder}</strong>, expiring on{' '}
                        <strong>{expiration.toString()}</strong>
                    </>
                );
            }

            if (transaction.parameters.entrypoint === 'addLiquidity') {
                const holder = JSONPath({ path: '$.args[0].args[0].string', json: transaction.parameters.value })[0];
                // TODO: $.args[0].args[1].int liquidity token balance
                const tokenAmount = new BigNumber(JSONPath({ path: '$.args[1].args[0].int', json: transaction.parameters.value })[0])
                    .dividedBy('1000000')
                    .toFixed();
                const expiration = new Date(JSONPath({ path: '$.args[1].args[1].string', json: transaction.parameters.value })[0]);

                return (
                    <>
                        &nbsp;to add <strong>{tokenAmount.toString()}</strong> USDtz to the pool from <strong>{holder}</strong>, expiring on{' '}
                        <strong>{expiration.toString()}</strong>
                    </>
                );
            }

            if (transaction.parameters.entrypoint === 'tokenToToken') {
                const targetToken = JSONPath({ path: '$.args[0].args[0].string', json: transaction.parameters.value })[0];
                // const targetName = knownContractNames[targetToken] || targetToken;
                const targetSymbol = knownMarketMetadata.filter((o) => o.address === targetToken)[0].symbol || 'tokens';
                const targetScale = knownMarketMetadata.filter((o) => o.address === targetToken)[0].scale || 0;
                const targetAmount = new BigNumber(JSONPath({ path: '$.args[0].args[1].args[0].int', json: transaction.parameters.value })[0])
                    .dividedBy(10 ** targetScale)
                    .toFixed();
                const targetHolder = JSONPath({ path: '$.args[0].args[1].args[1].string', json: transaction.parameters.value })[0];
                const sourceHolder = JSONPath({ path: '$.args[1].args[0].string', json: transaction.parameters.value })[0];
                const sourceAmount = new BigNumber(JSONPath({ path: '$.args[1].args[1].args[0].int', json: transaction.parameters.value })[0])
                    .dividedBy('1000000')
                    .toFixed();
                const expiration = new Date(JSONPath({ path: '$.args[1].args[1].args[1].string', json: transaction.parameters.value })[0]);

                let holderText = '';
                if (targetHolder === sourceHolder) {
                    holderText = `for ${targetHolder}`;
                } else {
                    holderText = `from ${sourceHolder} to ${targetHolder}`;
                }

                return (
                    <>
                        &nbsp;to exchange <strong>{sourceAmount.toString()}</strong> USDtz for <strong>{targetAmount.toString()}</strong> {targetSymbol}{' '}
                        <strong>{holderText}</strong>, expiring on <strong>{expiration.toString()}</strong>
                    </>
                );
            }

            return undefined;
        }

        if (transaction.destination === 'KT1D56HQfMmwdopmFLTwNHFJSs6Dsg2didFo') {
            // Dexter wXTZ Pool
            if (transaction.parameters.entrypoint === 'xtzToToken') {
                const holder = JSONPath({ path: '$.args[0].string', json: transaction.parameters.value })[0];
                const tokenAmount = new BigNumber(JSONPath({ path: '$.args[1].args[0].int', json: transaction.parameters.value })[0])
                    .dividedBy('1000000')
                    .toFixed();
                const expiration = new Date(JSONPath({ path: '$.args[1].args[1].string', json: transaction.parameters.value })[0]);

                return (
                    <>
                        &nbsp;to receive <strong>{tokenAmount.toString()}</strong> wXTZ at <strong>{holder}</strong>, expiring on{' '}
                        <strong>{expiration.toString()}</strong>
                    </>
                );
            }

            if (transaction.parameters.entrypoint === 'addLiquidity') {
                const holder = JSONPath({ path: '$.args[0].args[0].string', json: transaction.parameters.value })[0];
                // TODO: $.args[0].args[1].int liquidity token balance
                const tokenAmount = new BigNumber(JSONPath({ path: '$.args[1].args[0].int', json: transaction.parameters.value })[0])
                    .dividedBy('1000000')
                    .toFixed();
                const expiration = new Date(JSONPath({ path: '$.args[1].args[1].string', json: transaction.parameters.value })[0]);

                return (
                    <>
                        &nbsp;to add <strong>{tokenAmount.toString()}</strong> wXTZ to the pool from <strong>{holder}</strong>, expiring on{' '}
                        <strong>{expiration.toString()}</strong>
                    </>
                );
            }

            if (transaction.parameters.entrypoint === 'tokenToToken') {
                const targetToken = JSONPath({ path: '$.args[0].args[0].string', json: transaction.parameters.value })[0];
                // const targetName = knownContractNames[targetToken] || targetToken;
                const targetSymbol = knownMarketMetadata.filter((o) => o.address === targetToken)[0].symbol || 'tokens';
                const targetScale = knownMarketMetadata.filter((o) => o.address === targetToken)[0].scale || 0;
                const targetAmount = new BigNumber(JSONPath({ path: '$.args[0].args[1].args[0].int', json: transaction.parameters.value })[0])
                    .dividedBy(10 ** targetScale)
                    .toFixed();
                const targetHolder = JSONPath({ path: '$.args[0].args[1].args[1].string', json: transaction.parameters.value })[0];
                const sourceHolder = JSONPath({ path: '$.args[1].args[0].string', json: transaction.parameters.value })[0];
                const sourceAmount = new BigNumber(JSONPath({ path: '$.args[1].args[1].args[0].int', json: transaction.parameters.value })[0])
                    .dividedBy('1000000')
                    .toFixed();
                const expiration = new Date(JSONPath({ path: '$.args[1].args[1].args[1].string', json: transaction.parameters.value })[0]);

                let holderText = '';
                if (targetHolder === sourceHolder) {
                    holderText = `for ${targetHolder}`;
                } else {
                    holderText = `from ${sourceHolder} to ${targetHolder}`;
                }

                return (
                    <>
                        &nbsp;to exchange <strong>{sourceAmount.toString()}</strong> wXTZ for <strong>{targetAmount.toString()}</strong> {targetSymbol}{' '}
                        <strong>{holderText}</strong>, expiring on <strong>{expiration.toString()}</strong>
                    </>
                );
            }

            return undefined;
        }

        if (transaction.destination === 'KT1BGQR7t4izzKZ7eRodKWTodAsM23P38v7N') {
            // Dexter tzBTC Pool
            if (transaction.parameters.entrypoint === 'xtzToToken') {
                const holder = JSONPath({ path: '$.args[0].string', json: transaction.parameters.value })[0];
                const tokenAmount = new BigNumber(JSONPath({ path: '$.args[1].args[0].int', json: transaction.parameters.value })[0])
                    .dividedBy('100000000')
                    .toFixed();
                const expiration = new Date(JSONPath({ path: '$.args[1].args[1].string', json: transaction.parameters.value })[0]);

                return (
                    <>
                        &nbsp;to receive <strong>{tokenAmount.toString()}</strong> tzBTC at <strong>{holder}</strong>, expiring on{' '}
                        <strong>{expiration.toString()}</strong>
                    </>
                );
            }

            if (transaction.parameters.entrypoint === 'addLiquidity') {
                const holder = JSONPath({ path: '$.args[0].args[0].string', json: transaction.parameters.value })[0];
                // TODO: $.args[0].args[1].int liquidity token balance
                const tokenAmount = new BigNumber(JSONPath({ path: '$.args[1].args[0].int', json: transaction.parameters.value })[0])
                    .dividedBy('100000000')
                    .toFixed();
                const expiration = new Date(JSONPath({ path: '$.args[1].args[1].string', json: transaction.parameters.value })[0]);

                return (
                    <>
                        &nbsp;to add <strong>{tokenAmount.toString()}</strong> tzBTC to the pool from <strong>{holder}</strong>, expiring on{' '}
                        <strong>{expiration.toString()}</strong>
                    </>
                );
            }

            if (transaction.parameters.entrypoint === 'tokenToToken') {
                const targetToken = JSONPath({ path: '$.args[0].args[0].string', json: transaction.parameters.value })[0];
                // const targetName = knownContractNames[targetToken] || targetToken;
                const targetSymbol = knownMarketMetadata.filter((o) => o.address === targetToken)[0].symbol || 'tokens';
                const targetScale = knownMarketMetadata.filter((o) => o.address === targetToken)[0].scale || 0;
                const targetAmount = new BigNumber(JSONPath({ path: '$.args[0].args[1].args[0].int', json: transaction.parameters.value })[0])
                    .dividedBy(10 ** targetScale)
                    .toFixed();
                const targetHolder = JSONPath({ path: '$.args[0].args[1].args[1].string', json: transaction.parameters.value })[0];
                const sourceHolder = JSONPath({ path: '$.args[1].args[0].string', json: transaction.parameters.value })[0];
                const sourceAmount = new BigNumber(JSONPath({ path: '$.args[1].args[1].args[0].int', json: transaction.parameters.value })[0])
                    .dividedBy('100000000')
                    .toFixed();
                const expiration = new Date(JSONPath({ path: '$.args[1].args[1].args[1].string', json: transaction.parameters.value })[0]);

                let holderText = '';
                if (targetHolder === sourceHolder) {
                    holderText = `for ${targetHolder}`;
                } else {
                    holderText = `from ${sourceHolder} to ${targetHolder}`;
                }

                return (
                    <>
                        &nbsp;to exchange <strong>{sourceAmount.toString()}</strong> tzBTC for <strong>{targetAmount.toString()}</strong> {targetSymbol}{' '}
                        <strong>{holderText}</strong>, expiring on <strong>{expiration.toString()}</strong>
                    </>
                );
            }

            return undefined;
        }

        if (transaction.destination === 'KT1AbYeDbjjcAnV1QK7EZUUdqku77CdkTuv6') {
            // Dexter kUSD Pool
            if (transaction.parameters.entrypoint === 'xtzToToken') {
                const holder = JSONPath({ path: '$.args[0].string', json: transaction.parameters.value })[0];
                const tokenAmount = new BigNumber(JSONPath({ path: '$.args[1].args[0].int', json: transaction.parameters.value })[0])
                    .dividedBy('1000000000000000000')
                    .toFixed();
                const expiration = new Date(JSONPath({ path: '$.args[1].args[1].string', json: transaction.parameters.value })[0]);

                return (
                    <>
                        &nbsp;to receive <strong>{tokenAmount.toString()}</strong> kUSD at <strong>{holder}</strong>, expiring on{' '}
                        <strong>{expiration.toString()}</strong>
                    </>
                );
            }

            if (transaction.parameters.entrypoint === 'addLiquidity') {
                const holder = JSONPath({ path: '$.args[0].args[0].string', json: transaction.parameters.value })[0];
                // TODO: $.args[0].args[1].int liquidity token balance
                const tokenAmount = new BigNumber(JSONPath({ path: '$.args[1].args[0].int', json: transaction.parameters.value })[0])
                    .dividedBy('1000000000000000000')
                    .toFixed();
                const expiration = new Date(JSONPath({ path: '$.args[1].args[1].string', json: transaction.parameters.value })[0]);

                return (
                    <>
                        &nbsp;to add <strong>{tokenAmount.toString()}</strong> kUSD to the pool from <strong>{holder}</strong>, expiring on{' '}
                        <strong>{expiration.toString()}</strong>
                    </>
                );
            }

            if (transaction.parameters.entrypoint === 'tokenToToken') {
                const targetToken = JSONPath({ path: '$.args[0].args[0].string', json: transaction.parameters.value })[0];
                // const targetName = knownContractNames[targetToken] || targetToken;
                const targetSymbol = knownMarketMetadata.filter((o) => o.address === targetToken)[0].symbol || 'tokens';
                const targetScale = knownMarketMetadata.filter((o) => o.address === targetToken)[0].scale || 0;
                const targetAmount = new BigNumber(JSONPath({ path: '$.args[0].args[1].args[0].int', json: transaction.parameters.value })[0])
                    .dividedBy(10 ** targetScale)
                    .toFixed();
                const targetHolder = JSONPath({ path: '$.args[0].args[1].args[1].string', json: transaction.parameters.value })[0];
                const sourceHolder = JSONPath({ path: '$.args[1].args[0].string', json: transaction.parameters.value })[0];
                const sourceAmount = new BigNumber(JSONPath({ path: '$.args[1].args[1].args[0].int', json: transaction.parameters.value })[0])
                    .dividedBy('1000000000000000000')
                    .toFixed();
                const expiration = new Date(JSONPath({ path: '$.args[1].args[1].args[1].string', json: transaction.parameters.value })[0]);

                let holderText = '';
                if (targetHolder === sourceHolder) {
                    holderText = `for ${targetHolder}`;
                } else {
                    holderText = `from ${sourceHolder} to ${targetHolder}`;
                }

                return (
                    <>
                        &nbsp;to exchange <strong>{sourceAmount.toString()}</strong> kUSD for <strong>{targetAmount.toString()}</strong> {targetSymbol}{' '}
                        <strong>{holderText}</strong>, expiring on <strong>{expiration.toString()}</strong>
                    </>
                );
            }

            return undefined;
        }

        if (transaction.destination === 'KT19at7rQUvyjxnZ2fBv7D9zc8rkyG7gAoU8') {
            // ETHtz Token
            if (transaction.parameters.entrypoint === 'approve') {
                let approvedAddress = JSONPath({ path: '$.args[0].string', json: transaction.parameters.value })[0];
                const tokenAmount = new BigNumber(JSONPath({ path: '$.args[1].int', json: transaction.parameters.value })[0])
                    .dividedBy('1000000000000000000')
                    .toFixed();

                approvedAddress = knownContractNames[approvedAddress] || approvedAddress;

                return (
                    <>
                        &nbsp;to approve <strong>{approvedAddress}</strong> for a balance of <strong>{tokenAmount}</strong> ETHtz
                    </>
                );
            }

            // TODO: transfer

            return undefined;
        }

        if (transaction.destination === 'KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9') {
            // USDtz Token
            if (transaction.parameters.entrypoint === 'approve') {
                let approvedAddress = JSONPath({ path: '$.args[0].string', json: transaction.parameters.value })[0];
                const tokenAmount = new BigNumber(JSONPath({ path: '$.args[1].int', json: transaction.parameters.value })[0]).dividedBy('1000000').toFixed();

                approvedAddress = knownContractNames[approvedAddress] || approvedAddress;

                return (
                    <>
                        &nbsp;to approve <strong>{approvedAddress}</strong> for a balance of <strong>{tokenAmount}</strong> USDtz
                    </>
                );
            }

            // TODO: transfer

            return undefined;
        }

        if (transaction.destination === 'KT1VYsVfmobT7rsMVivvZ4J8i3bPiqz12NaH') {
            // wXTZ Token
            if (transaction.parameters.entrypoint === 'approve') {
                let approvedAddress = JSONPath({ path: '$.args[0].string', json: transaction.parameters.value })[0];
                const tokenAmount = new BigNumber(JSONPath({ path: '$.args[1].int', json: transaction.parameters.value })[0]).dividedBy('1000000').toFixed();

                approvedAddress = knownContractNames[approvedAddress] || approvedAddress;

                return (
                    <>
                        &nbsp;to approve <strong>{approvedAddress}</strong> for a balance of <strong>{tokenAmount}</strong> wXTZ
                    </>
                );
            }

            // TODO: transfer

            return undefined;
        }

        if (transaction.destination === 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn') {
            // tzBTC Token
            if (transaction.parameters.entrypoint === 'approve') {
                let approvedAddress = JSONPath({ path: '$.args[0].string', json: transaction.parameters.value })[0];
                const tokenAmount = new BigNumber(JSONPath({ path: '$.args[1].int', json: transaction.parameters.value })[0]).dividedBy('100000000').toFixed();

                approvedAddress = knownContractNames[approvedAddress] || approvedAddress;

                return (
                    <>
                        &nbsp;to approve <strong>{approvedAddress}</strong> for a balance of <strong>{tokenAmount}</strong> tzBTC
                    </>
                );
            }

            // TODO: transfer

            return undefined;
        }

        if (transaction.destination === 'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV') {
            // kUSD Token
            if (transaction.parameters.entrypoint === 'approve') {
                let approvedAddress = JSONPath({ path: '$.args[0].string', json: transaction.parameters.value })[0];
                const tokenAmount = new BigNumber(JSONPath({ path: '$.args[1].int', json: transaction.parameters.value })[0])
                    .dividedBy('1000000000000000000')
                    .toFixed();

                approvedAddress = knownContractNames[approvedAddress] || approvedAddress;

                return (
                    <>
                        &nbsp;to approve <strong>{approvedAddress}</strong> for a balance of <strong>{tokenAmount}</strong> kUSD
                    </>
                );
            }

            // TODO: transfer

            return undefined;
        }

        if (transaction.destination === 'KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9') {
            // hic et nunc Auction House
            if (transaction.parameters.entrypoint === 'collect') {
                const tokenAmount = new BigNumber(JSONPath({ path: '$.args[0].int', json: transaction.parameters.value })[0]).toString();
                const swapId = new BigNumber(JSONPath({ path: '$.args[1].int', json: transaction.parameters.value })[0]);

                const formattedAmount = formatAmount(amount);
                const swapInfo = queryHicEtNuncSwap(swapId.toNumber());

                if (swapInfo.source === swapInfo.nftCreators) {
                    return (
                        <>
                            &nbsp;to collect{' '}
                            <strong>
                                {tokenAmount}/{swapInfo.stock}
                            </strong>{' '}
                            OBJKT #{swapInfo.nftId} from the creator – {swapInfo.source} for a balance of <strong>{formattedAmount}</strong> XTZ. OBJKT #
                            {swapInfo.nftId} is "{swapInfo.nftName}", described as "{swapInfo.nftDescription}".
                        </>
                    );
                } else {
                    return (
                        <>
                            &nbsp;to collect{' '}
                            <strong>
                                {tokenAmount}/{swapInfo.stock}
                            </strong>{' '}
                            OBJKT #{swapInfo.nftId} from {swapInfo.source} for a balance of <strong>{formattedAmount}</strong> XTZ. OBJKT #{swapInfo.nftId} is "
                            {swapInfo.nftName}", described as "{swapInfo.nftDescription}", created by {swapInfo.nftCreators}.
                        </>
                    );
                }
            } else if (transaction.parameters.entrypoint === 'mint_OBJKT') {
                const tokenAmount = new BigNumber(JSONPath({ path: '$.args[0].args[1].int', json: transaction.parameters.value })[0]).toString();
                const royaltyAmount = Number(JSONPath({ path: '$.args[1].args[1].int', json: transaction.parameters.value })[0]);
                const metadataString = JSONPath({ path: '$.args[1].args[0].bytes', json: transaction.parameters.value })[0].toString();
                const metadataUrl = Buffer.from(metadataString, 'hex').toString(); // TODO: download and parse metadata

                return (
                    <>
                        &nbsp;to mint&nbsp;
                        <strong>{tokenAmount} OBJKT</strong>
                        {royaltyAmount > 0 && (
                            <span>
                                &nbsp;with&nbsp;<strong>{(royaltyAmount / 10).toFixed(1)}%</strong>&nbsp;royalties
                            </span>
                        )}
                        {!royaltyAmount && <span> without royalties</span>}
                    </>
                );
                // } else if (transaction.parameters.entrypoint === 'transfer') {
            }

            return undefined;
        }

        return undefined;
    };

    return (
        <ModalWrapper open={open}>
            {open ? (
                <ModalContainer>
                    <Container>
                        <div className="modal-holder">
                            {operationDetails.length === 1 && <h3>{t('components.Beacon.authorization.title', { network: network.type })}</h3>}
                            {operationDetails.length > 1 && <h3>{t('components.Beacon.authorization.title_plural', { network: network.type })}</h3>}
                            <p className="linkAddress">{website}</p>
                            {!isContract && (
                                <p>
                                    {appMetadata.name} is requesting a transaction of <strong>{formatAmount(operationDetails[0].amount, 6)}</strong>
                                    <strong>{'\ua729'}</strong> to <strong>{operationDetails[0].destination}</strong>
                                </p>
                            )}
                            {isContract && (
                                <p>
                                    <strong>{appMetadata.name}</strong> is requesting a contract call to the <strong>{operationParameters.entrypoint}</strong>{' '}
                                    function of <strong>{contractName}</strong>
                                    {new BigNumber(operationDetails[0].amount).toNumber() !== 0 && (
                                        <span>
                                            {' '}
                                            with <strong>{formatAmount(operationDetails[0].amount, 6)}</strong> <strong>{'\ua729'}</strong>
                                        </span>
                                    )}
                                    {idTransaction(operationDetails[0]) && idTransaction(operationDetails[0])}
                                    {!idTransaction(operationDetails[0]) && (
                                        <>
                                            &nbsp;with the following parameters: <strong>{JSON.stringify(operationParameters.value)}</strong>
                                        </>
                                    )}
                                </p>
                            )}

                            {isContract && operationDetails.length > 1 && (
                                <p>
                                    and {operationDetails.length - 1} more operation{operationDetails.length - 1 > 1 ? 's' : ''}.
                                </p>
                            )}

                            {isContract && (
                                <div>
                                    <p className="inputLabel">Raw Operation Content</p>
                                    <textarea className="inputField" readOnly={true} value={JSON.stringify(operationDetails, null, 2)} />
                                </div>
                            )}
                            <div className="feeContainer">
                                <TezosNumericInput
                                    decimalSeparator={t('general.decimal_separator')}
                                    label={'Operation Fee'}
                                    amount={fee}
                                    onChange={setFee}
                                    errorText={feeError}
                                />
                            </div>

                            {!isLedger && (
                                <WrapPassword>
                                    <PasswordInput label={t('general.nouns.wallet_password')} password={password} onChange={(pwd) => setPassword(pwd)} />
                                </WrapPassword>
                            )}

                            <p className="subtitleText">
                                Authorizing will allow this site to carry out this operation for you. Always make sure you trust the sites you interact with.
                            </p>
                        </div>
                    </Container>
                    {beaconLoading && <Loader />}
                    <Footer>
                        {!ledgerModalOpen && (
                            <ButtonContainer>
                                <WhiteBtn buttonTheme="secondary" onClick={onCancel}>
                                    {t('general.verbs.cancel')}
                                </WhiteBtn>
                                <InvokeButton buttonTheme="primary" onClick={onAuthorize}>
                                    {t('general.verbs.authorize')}
                                </InvokeButton>
                            </ButtonContainer>
                        )}

                        {isLedger && ledgerModalOpen && (
                            <ButtonContainer>
                                <>Please confirm the operation on the Ledger device</>
                            </ButtonContainer>
                        )}
                    </Footer>
                </ModalContainer>
            ) : (
                <ModalContainer />
            )}
        </ModalWrapper>
    );
};

export default BeaconAuthorize;
