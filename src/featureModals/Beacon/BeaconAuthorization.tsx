import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';
import { BeaconMessageType, OperationResponseInput, BeaconErrorType, BeaconResponseInputMessage } from '@airgap/beacon-sdk';
import { BigNumber } from 'bignumber.js';
import { JSONPath } from 'jsonpath-plus';

import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import AddCircle from '@mui/icons-material/AddCircle';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import { ms } from '../../styles/helpers';
import Loader from '../../components/Loader';
import TextField from '../../components/TextField';
import TezosNumericInput from '../../components/TezosNumericInput';
import PasswordInput from '../../components/PasswordInput';

import { RootState, ModalState } from '../../types/store';
import { formatAmount, tezToUtez } from '../../utils/currency';
import { knownContractNames, knownTokenContracts, knownMarketMetadata } from '../../constants/Token';

import { sendTezThunk } from '../../contracts/duck/thunks';
import { setModalOpen } from '../../reduxContent/modal/actions';
import { setBeaconLoading } from '../../reduxContent/app/actions';
import { createMessageAction } from '../../reduxContent/message/actions';

import { ModalWrapper, ModalContainer, Container, ButtonContainer, InvokeButton, WhiteBtn, Footer } from '../style';

import { estimateOperationGroupFee, sendOperations, queryHicEtNuncSwap } from './thunks';
import { WrapPassword, OperationDetailHeader, LabelText } from './style';
import { beaconClient } from './BeaconMessageRouter';

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
    const [showOperationDetails, setShowOperationDetails] = useState(false);

    const [useCustomFee, setCustomFeeFlag] = useState(false);
    const [customFee, setCustomFee] = useState('0');
    const [customGasLimit, setCustomGasLimit] = useState('0');
    const [customStorageLimit, setCustomStorageLimit] = useState('0');

    const { id, operationDetails, website, network, appMetadata } = modalValues[activeModal];
    const isContract = String(operationDetails[0].destination).startsWith('KT1'); // TODO: // recognize contract call and simple transaction
    const isDelegation = operationDetails[0].kind === 'delegation';
    const isOrigination = operationDetails[0].kind === 'origination';
    const { destination, amount, parameters } = operationDetails[0];
    const operationParameters = parameters || { value: { prim: 'Unit' }, entrypoint: 'default' };

    const estimates = estimateOperationGroupFee(selectedParentHash, operationDetails);
    const estimatedMinimumFee = estimates.estimatedFee;

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

            const utezFee = tezToUtez(fee);

            if (isContract || isDelegation || isOrigination) {
                // TODO: errors from here don't always bubble up

                const operationResult = !useCustomFee ? await dispatch(sendOperations(password, operationDetails, utezFee, estimates.estimatedGas, estimates.estimatedStorage)) : await dispatch(sendOperations(password, operationDetails, tezToUtez(customFee), parseInt(customGasLimit, 10), parseInt(customStorageLimit, 10)));

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
        if (!estimates.estimatedFee) {
            setFee('0');
            setFeeError('');
        } else if (estimates.feeError && estimates.feeError.length > 0) {
            setFeeError(estimates.feeError);
        } else {
            setFeeError('');
            setFee(formatAmount(estimates.estimatedFee));
            setCustomFee(formatAmount(estimates.estimatedFee));
        }

        if (typeof estimates.estimatedStorage === 'number') {
            setCustomStorageLimit(estimates.estimatedStorage);
        }
        if (typeof estimates.estimatedGas === 'number') {
            setCustomGasLimit(estimates.estimatedGas);
        }
    }, [estimates]);

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
        const dexterPools = knownMarketMetadata.filter((market) => market.name.startsWith('Dexter')).map((market) => market.address);
        const quipuPools = knownMarketMetadata.filter((market) => market.name.startsWith('QuipuSwap')).map((market) => market.address);
        const tzip7Tokens = ['KT19at7rQUvyjxnZ2fBv7D9zc8rkyG7gAoU8', 'KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9', 'KT1VYsVfmobT7rsMVivvZ4J8i3bPiqz12NaH', 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn', 'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV', 'KT1AEfeckNbdEYwaMKkytBwPJPycz7jdSGea'];

        let selectedToken = knownTokenContracts.find((token) => token.address === transaction.destination);

        if (dexterPools.includes(transaction.destination) || quipuPools.includes(transaction.destination)) {
            const marketToken = knownMarketMetadata.find((market) => market.address === transaction.destination)?.token;
            selectedToken = knownTokenContracts.find((token) => token.address === marketToken);
        }

        const selectedTokenScale = new BigNumber(10).pow(selectedToken?.scale || 0);
        const selectedTokenSymbol = selectedToken?.symbol || '';

        if (dexterPools.includes(transaction.destination)) {
            if (transaction.parameters.entrypoint === 'xtzToToken') {
                const holder = JSONPath({ path: '$.args[0].string', json: transaction.parameters.value })[0];
                const tokenAmount = new BigNumber(JSONPath({ path: '$.args[1].args[0].int', json: transaction.parameters.value })[0]).dividedBy(selectedTokenScale).toFixed();
                const expiration = new Date(JSONPath({ path: '$.args[1].args[1].string', json: transaction.parameters.value })[0]);

                return (
                    <>
                        &nbsp;to receive <strong>{tokenAmount.toString()}</strong> {selectedTokenSymbol} at <strong>{holder}</strong>, expiring on <strong>{expiration.toString()}</strong>
                    </>
                );
            }

            if (transaction.parameters.entrypoint === 'addLiquidity') {
                const holder = JSONPath({ path: '$.args[0].args[0].string', json: transaction.parameters.value })[0];
                // TODO: $.args[0].args[1].int liquidity token balance
                const tokenAmount = new BigNumber(JSONPath({ path: '$.args[1].args[0].int', json: transaction.parameters.value })[0]).dividedBy(selectedTokenScale).toFixed();
                const expiration = new Date(JSONPath({ path: '$.args[1].args[1].string', json: transaction.parameters.value })[0]);

                return (
                    <>
                        &nbsp;to add <strong>{tokenAmount.toString()}</strong> {selectedTokenSymbol} to the pool from
                        <strong>{holder}</strong>, expiring on <strong>{expiration.toString()}</strong>
                    </>
                );
            }

            if (transaction.parameters.entrypoint === 'tokenToToken') {
                const targetToken = JSONPath({ path: '$.args[0].args[0].string', json: transaction.parameters.value })[0];
                // const targetName = knownContractNames[targetToken] || targetToken;
                const targetSymbol = knownMarketMetadata.filter((o) => o.address === targetToken)[0].symbol || 'tokens';
                const targetScale = knownMarketMetadata.filter((o) => o.address === targetToken)[0].scale || 0;
                const targetAmount = new BigNumber(JSONPath({ path: '$.args[0].args[1].args[0].int', json: transaction.parameters.value })[0]).dividedBy(10 ** targetScale).toFixed();
                const targetHolder = JSONPath({ path: '$.args[0].args[1].args[1].string', json: transaction.parameters.value })[0];
                const sourceHolder = JSONPath({ path: '$.args[1].args[0].string', json: transaction.parameters.value })[0];
                const sourceAmount = new BigNumber(JSONPath({ path: '$.args[1].args[1].args[0].int', json: transaction.parameters.value })[0]).dividedBy(selectedTokenScale).toFixed();
                const expiration = new Date(JSONPath({ path: '$.args[1].args[1].args[1].string', json: transaction.parameters.value })[0]);

                let holderText = '';
                if (targetHolder === sourceHolder) {
                    holderText = `for ${targetHolder}`;
                } else {
                    holderText = `from ${sourceHolder} to ${targetHolder}`;
                }

                return (
                    <>
                        &nbsp;to exchange <strong>{sourceAmount.toString()}</strong> {selectedTokenSymbol} for <strong>{targetAmount.toString()}</strong> {targetSymbol} <strong>{holderText}</strong>, expiring on <strong>{expiration.toString()}</strong>
                    </>
                );
            }

            return undefined;
        }

        /** FA1.2-like tokens */
        if (tzip7Tokens.includes(transaction.destination)) {
            if (transaction.parameters.entrypoint === 'approve') {
                let approvedAddress = JSONPath({ path: '$.args[0].string', json: transaction.parameters.value })[0];
                const tokenAmount = new BigNumber(JSONPath({ path: '$.args[1].int', json: transaction.parameters.value })[0]).dividedBy(selectedTokenScale).toFixed();

                approvedAddress = knownContractNames[approvedAddress] || approvedAddress;

                return (
                    <>
                        &nbsp;to approve <strong>{approvedAddress}</strong> for a balance of <strong>{tokenAmount}</strong> {selectedTokenSymbol}
                    </>
                );
            }

            // TODO: transfer

            return undefined;
        }

        if (Object.keys(knownContractNames).includes(transaction.destination)) {
            if (transaction.parameters.entrypoint === 'GetReward') {
                return <>&nbsp;to collect PLENTY pool rewards.</>;
            }
        }

        if (transaction.destination === 'KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9' || transaction.destination === 'KT1HbQepzV1nVGg8QVznG7z4RcHseD5kwqBn') {
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
                            OBJKT #{swapInfo.nftId} from the creator – {swapInfo.source} for a balance of <strong>{formattedAmount}</strong> XTZ. OBJKT #{swapInfo.nftId} is "{swapInfo.nftName}", described as "{swapInfo.nftDescription}".
                        </>
                    );
                } else {
                    return (
                        <>
                            &nbsp;to collect{' '}
                            <strong>
                                {tokenAmount}/{swapInfo.stock}
                            </strong>{' '}
                            OBJKT #{swapInfo.nftId} from {swapInfo.source} for a balance of <strong>{formattedAmount}</strong> XTZ. OBJKT #{swapInfo.nftId} is "{swapInfo.nftName}", described as "{swapInfo.nftDescription}", created by {swapInfo.nftCreators}.
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
                //
            } else if (transaction.parameters.entrypoint === 'swap') {
                const volume = Number(JSONPath({ path: '$.args[0].int', json: transaction.parameters.value })[0]);
                const item = Number(JSONPath({ path: '$.args[1].args[0].int', json: transaction.parameters.value })[0]);
                const price = JSONPath({ path: '$.args[1].args[1].int', json: transaction.parameters.value })[0];
                return (
                    <>
                        {' '}
                        to list <strong>{volume}</strong> OBJKT <strong>{item}</strong> for <strong>{formatAmount(price)}</strong> XTZ.
                    </>
                );
            }

            return undefined;
        }

        if (transaction.destination === 'KT1REEb5VxWRjcHm5GzDMwErMmNFftsE5Gpf') {
            // USDS token
            if (transaction.parameters.entrypoint === 'update_operators') {
                let approvedAddress = JSONPath({ path: '$.[0].args[0].args[1].args[0].string', json: transaction.parameters.value })[0];

                approvedAddress = knownContractNames[approvedAddress] || approvedAddress;

                return (
                    <>
                        &nbsp;to approve <strong>{approvedAddress}</strong>
                    </>
                );
            }
        }

        if (quipuPools.includes(transaction.destination)) {
            if (transaction.parameters.entrypoint === 'use') {
                const holder = JSONPath({ path: '$.args[0].args[0].args[0].args[1].string', json: transaction.parameters.value })[0];
                const tokenAmount = new BigNumber(JSONPath({ path: '$.args[0].args[0].args[0].args[0].int', json: transaction.parameters.value })[0]).dividedBy(selectedTokenScale).toFixed();

                return (
                    <>
                        &nbsp;to receive <strong>{tokenAmount.toString()}</strong> {selectedTokenSymbol} at <strong>{holder}</strong>
                    </>
                );
            } else if (transaction.parameters.entrypoint === 'approve') {
                let approvedAddress = JSONPath({ path: '$.args[0].string', json: transaction.parameters.value })[0];
                approvedAddress = knownContractNames[approvedAddress] || approvedAddress;
                const tokenAmount = new BigNumber(JSONPath({ path: '$.args[1].int', json: transaction.parameters.value })[0]).dividedBy(6).toFixed();

                return (
                    <>
                        &nbsp;to approve <strong>{approvedAddress}</strong> for <strong>{tokenAmount}</strong> liquidity tokens.
                    </>
                );
            }
        }

        // Tezos Domains
        if (transaction.destination === 'KT1P8n2qzJjwMPbHJfi4o8xu6Pe3gaU3u2A3') {
            if (transaction.parameters.entrypoint === 'commit') {
                return <>&nbsp;to commit a name.</>;
            }
        }

        if (transaction.destination === 'KT191reDVKrLxU9rjTSxg53wRqj6zh8pnHgr') {
            if (transaction.parameters.entrypoint === 'buy') {
                const domainBytes = JSONPath({ path: '$.args[0].bytes', json: transaction.parameters.value })[0].toString();
                const domainName = Buffer.from(domainBytes, 'hex').toString();

                const formattedAmount = formatAmount(amount);

                const durationDays = Number(JSONPath({ path: '$.args[1].args[0].int', json: transaction.parameters.value })[0]);

                const owner = JSONPath({ path: '$.args[1].args[1].args[0].string', json: transaction.parameters.value })[0];

                let redirect = '';
                try {
                    redirect = JSONPath({ path: '$.args[1].args[1].args[1].args[0].args[0].string', json: transaction.parameters.value })[0];
                } catch {
                    /* meh */
                }

                return (
                    <>
                        &nbsp;to register <strong>{domainName}.tez</strong> as {owner} for <strong>{formattedAmount} XTZ</strong> for a period of <strong>{durationDays} days</strong>{' '}
                        {redirect && redirect.length > 0 && (
                            <>
                                {' '}
                                and point it at <strong>{redirect}</strong>
                            </>
                        )}{' '}
                        {!redirect && <> without redirect</>}.
                    </>
                );
            }
        }

        if (transaction.destination === 'KT1CaSP4dn8wasbMsfdtGiCPgYFW7bvnPRRT') {
            if (transaction.parameters.entrypoint === 'bid') {
                const domainBytes = JSONPath({ path: '$.args[0].bytes', json: transaction.parameters.value })[0].toString();
                const domainName = Buffer.from(domainBytes, 'hex').toString();

                const bidAmount = new BigNumber(JSONPath({ path: '$.args[1].int', json: transaction.parameters.value })[0]).dividedBy(1_000_000).toFixed();

                return (
                    <>
                        &nbsp;to bid <strong>{bidAmount} XTZ</strong> on <strong>{domainName}.tez</strong>.
                    </>
                );
            }
        }

        if (transaction.destination === 'KT1TnTr6b2YxSx2xUQ8Vz3MoWy771ta66yGx') {
            if (transaction.parameters.entrypoint === 'claim_reverse_record') {
                const domainBytes = JSONPath({ path: '$.args[0].args[0].bytes', json: transaction.parameters.value })[0].toString();
                const domainName = Buffer.from(domainBytes, 'hex').toString();
                const domainAddress = JSONPath({ path: '$.args[1].string', json: transaction.parameters.value })[0].toString();

                return (
                    <>
                        &nbsp;to associate <strong>{domainName}</strong> with <strong>{domainAddress}</strong>.
                    </>
                );
            }
        }

        if (transaction.destination === 'KT1J9VpjiH5cmcsskNb8gEXpBtjD4zrAx4Vo') {
            if (transaction.parameters.entrypoint === 'update_reverse_record') {
                let domainName = '';
                const updateAction = JSONPath({ path: '$.args[1].args[0].prim', json: transaction.parameters.value })[0].toString();
                const domainAddress = JSONPath({ path: '$.args[0].string', json: transaction.parameters.value })[0].toString();

                if (updateAction === 'Some') {
                    const domainBytes = JSONPath({ path: '$.args[1].args[0].args[0].bytes', json: transaction.parameters.value })[0].toString();
                    domainName = Buffer.from(domainBytes, 'hex').toString();

                    return (
                        <>
                            &nbsp;to associate <strong>{domainName}</strong> with <strong>{domainAddress}</strong>.
                        </>
                    );
                } else {
                    return (
                        <>
                            &nbsp;to clear domain association from <strong>{domainAddress}</strong>.
                        </>
                    );
                }
            }
        }

        if (transaction.destination === 'KT1EpGgjQs73QfFJs9z7m1Mxm5MTnpC2tqse') {
            // Kalamint
            try {
                if (transaction.parameters.entrypoint === 'mint') {
                    const editions = Number(JSONPath({ path: '$.args[1].args[1].args[0].int', json: transaction.parameters.value })[0]);
                    const royalties = Number(JSONPath({ path: '$.args[1].args[0].args[1].int', json: transaction.parameters.value })[0]);
                    const itemTitle = JSONPath({ path: '$.args[2].args[0].args[1].args[0].string', json: transaction.parameters.value })[0].toString();

                    return (
                        <>
                            &nbsp;to mint <strong>{editions}</strong> NFT{editions > 1 ? 's' : ''} with royalties of <strong>{royalties}%</strong> titled <strong>{itemTitle}</strong>.
                        </>
                    );
                }
            } catch (kalamintError) {
                console.log('error parsing kalamint request', kalamintError, transaction);
            }
        } else if (transaction.destination === 'KT1MiSxkVDFDrAMYCZZXdBEkNrf1NWzfnnRR') {
            if (transaction.parameters.entrypoint === 'create_auction') {
                // TODO
            }
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
                            {isOrigination && <p>{appMetadata.name} is requesting a contract deployment</p>}
                            {isDelegation && (
                                <p>
                                    {appMetadata.name} is requesting a delegation to <strong>{operationDetails[0].delegate}</strong>
                                </p>
                            )}
                            {!isContract && !isDelegation && !isOrigination && (
                                <p>
                                    {appMetadata.name} is requesting a transaction of <strong>{formatAmount(operationDetails[0].amount, 6)}</strong>
                                    <strong>{'\ua729'}</strong> to <strong>{operationDetails[0].destination}</strong>
                                </p>
                            )}
                            {isContract && (
                                <p style={{ maxHeight: 200, overflow: 'scroll' }}>
                                    <strong>{appMetadata.name}</strong> is requesting a contract call to the <strong>{operationParameters.entrypoint}</strong> function of <strong>{contractName}</strong>
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

                            <div>
                                <OperationDetailHeader onClick={() => setShowOperationDetails(!showOperationDetails)}>
                                    <span>Raw Operation Content</span>
                                    {showOperationDetails ? <ExpandLess style={{ verticalAlign: 'bottom' }} /> : <ExpandMore style={{ verticalAlign: 'bottom' }} />}
                                </OperationDetailHeader>
                                <Collapse easing={'none'} enter={false} exit={false} in={showOperationDetails} timeout="auto" unmountOnExit={true}>
                                    <textarea className="inputField" readOnly={true} value={JSON.stringify(operationDetails, null, 2)} />
                                </Collapse>
                            </div>

                            {feeError === '' && (
                                <div>
                                    <div className="feeContainer" style={{ display: 'block', position: 'relative', top: '20px', width: '100%' }}>
                                        <div style={{ width: '75%', float: 'left' }}>
                                            <TezosNumericInput decimalSeparator={t('general.decimal_separator')} label={'Estimated Fee'} amount={fee} onChange={setFee} errorText={feeError} disabled={useCustomFee} readOnly={true} />
                                        </div>
                                        <div style={{ width: '25%', position: 'relative', top: '17px', float: 'left' }}>
                                            <IconButton size="small" color="primary" onClick={() => setCustomFeeFlag(!useCustomFee)}>
                                                {!useCustomFee && <AddIcon />}
                                                {useCustomFee && <RemoveIcon />}
                                                <LabelText>{useCustomFee ? t('components.fees.use_estimated_fee') : t('components.fees.set_custom_fee')}</LabelText>
                                            </IconButton>
                                        </div>
                                    </div>
                                    <div style={{ display: useCustomFee ? 'block' : 'none' }}>
                                        <div style={{ width: '30%', float: 'left', marginRight: '0.5em' }}>
                                            <TezosNumericInput decimalSeparator={t('general.decimal_separator')} label={t('components.fees.custom_fee')} amount={customFee} onChange={setCustomFee} errorText={tezToUtez(customFee) - estimatedMinimumFee < 0 ? 'below estimated value' : ''} />
                                        </div>
                                        <div style={{ width: '30%', float: 'left', marginRight: '0.5em' }}>
                                            <TextField type="number" label={t('components.interactModal.storage_limit')} onChange={setCustomStorageLimit} value={customStorageLimit} errorText={parseInt(customStorageLimit, 10) - estimates.estimatedStorage < 0 ? 'below estimated value' : ''} />
                                        </div>
                                        <div style={{ width: '30%', float: 'left' }}>
                                            <TextField type="number" label={t('components.interactModal.gas_limit')} onChange={setCustomGasLimit} value={customGasLimit} errorText={parseInt(customGasLimit, 10) - estimates.estimatedGas < 0 ? 'below estimated value' : ''} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {feeError !== '' && (
                                <div className="feeContainer">
                                    <p className="inputLabel">Validation Error</p>
                                    <p className="subtitleText">Could not estimate fee due to operation validation failure. Please contact the dApp developer for resolution.</p>
                                    <p className="inputLabel">Error Details</p>
                                    <p className="subtitleText" style={{ height: '40px', overflow: 'scroll' }}>
                                        {feeError.split(',').map((p, i) => (
                                            <div key={'error' + i}>{p}</div>
                                        ))}
                                    </p>
                                </div>
                            )}

                            {feeError === '' && !isLedger && (
                                <div style={{ float: 'left', width: '100%' }}>
                                    <WrapPassword>
                                        <PasswordInput label={t('general.nouns.wallet_password')} password={password} onChange={(pwd) => setPassword(pwd)} />
                                    </WrapPassword>
                                </div>
                            )}

                            {feeError === '' && (
                                <p className="subtitleText" style={{ float: 'left', width: '100%' }}>
                                    Authorizing will allow this site to carry out this operation for you. Always make sure you trust the sites you interact with.
                                </p>
                            )}
                        </div>
                    </Container>
                    {beaconLoading && <Loader />}
                    <Footer>
                        {!ledgerModalOpen && (
                            <ButtonContainer>
                                <WhiteBtn buttonTheme="secondary" onClick={onCancel}>
                                    {t('general.verbs.cancel')}
                                </WhiteBtn>
                                {feeError === '' && (
                                    <InvokeButton buttonTheme="primary" onClick={onAuthorize}>
                                        {t('general.verbs.authorize')}
                                    </InvokeButton>
                                )}
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
