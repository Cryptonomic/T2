import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { BigNumber } from 'bignumber.js';
import { OperationKindType } from 'conseiljs';

import InputAddress from '../../../components/InputAddress';
import Fees from '../../../components/Fees';
import PasswordInput from '../../../components/PasswordInput';
import NumericInput from '../../../components/NumericInput';
import TokenLedgerConfirmationModal from '../../../components/ConfirmModals/TokenLedgerConfirmationModal';

import InputError from '../../../components/InputError';

import { useFetchFees } from '../../../reduxContent/app/thunks';
import { setIsLoadingAction } from '../../../reduxContent/app/actions';
import { transferThunk } from '../thunks';

import { SEND } from '../../../constants/TabConstants';
import { AVERAGEFEES } from '../../../constants/FeeValue';
import { RootState, AppState } from '../../../types/store';
import { Container, AmountContainer, FeeContainer, PasswordButtonContainer, InvokeButton, RowContainer } from './style';

interface Props {
    isReady: boolean;
    balance: number;
    symbol: string;
}

function Send(props: Props) {
    const miniFee = 23647; // TODO

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [fee, setFee] = useState(Math.max(AVERAGEFEES.low, miniFee + 1000)); // TODO
    const [newAddress, setAddress] = useState('');
    const [passPhrase, setPassPhrase] = useState('');
    const [isAddressIssue, setIsAddressIssue] = useState(false);
    const [amount, setAmount] = useState('');
    const [open, setOpen] = useState(false);
    const { newFees } = useFetchFees(OperationKindType.Transaction, false);

    const { isLoading, isLedger, selectedParentHash } = useSelector<RootState, AppState>((state: RootState) => state.app, shallowEqual);

    const { isReady, balance, symbol } = props;

    const isDisabled = !isReady || isLoading || isAddressIssue || !newAddress || (!passPhrase && !isLedger);

    function getBalanceState() {
        const realAmount = !amount ? Number(amount) : 0;
        if (balance < realAmount) {
            return {
                isIssue: true,
                warningMessage: t('components.send.warnings.total_exceeds')
            };
        }

        return {
            isIssue: false,
            warningMessage: ''
        };
    }

    async function onSend() {
        dispatch(setIsLoadingAction(true));

        if (isLedger) {
            setOpen(true);
        }

        await dispatch(transferThunk(newAddress, new BigNumber(amount).multipliedBy(10 ** 8).toNumber(), fee, passPhrase));
        setOpen(false);
        dispatch(setIsLoadingAction(false));
    }

    function onEnterPress(keyVal) {
        if (keyVal === 'Enter' && !isDisabled) {
            onSend();
        }
    }

    const { isIssue, warningMessage } = getBalanceState();
    const error = isIssue ? <InputError error={warningMessage} /> : '';

    return (
        <Container onKeyDown={event => onEnterPress(event.key)}>
            <RowContainer>
                <InputAddress
                    label={t('components.send.recipient_address')}
                    operationType="send"
                    tooltip={false}
                    onChange={val => setAddress(val)}
                    onIssue={val => setIsAddressIssue(val)}
                />
            </RowContainer>
            <RowContainer>
                <AmountContainer>
                    <NumericInput
                        label={t('general.nouns.amount')}
                        amount={amount}
                        onChange={val => setAmount(val)}
                        errorText={error}
                        symbol={symbol}
                        scale={8}
                        precision={8}
                        maxValue={new BigNumber(balance).dividedBy(10 ** 8).toNumber() /* TODO */}
                        minValue={0.000_000_01 /* TODO 1 / (10 ** scale) */}
                    />
                </AmountContainer>
                <FeeContainer>
                    <Fees low={newFees.low} medium={newFees.medium} high={newFees.high} fee={fee} miniFee={miniFee} onChange={val => setFee(val)} />
                </FeeContainer>
            </RowContainer>

            <PasswordButtonContainer>
                {!isLedger && (
                    <PasswordInput
                        label={t('general.nouns.wallet_password')}
                        password={passPhrase}
                        onChange={val => setPassPhrase(val)}
                        containerStyle={{ width: '47%', marginTop: '10px' }}
                    />
                )}
                <InvokeButton buttonTheme="primary" disabled={isDisabled} onClick={() => onSend()}>
                    {t('general.verbs.send')}
                </InvokeButton>
            </PasswordButtonContainer>
            {isLedger && open && (
                <TokenLedgerConfirmationModal
                    fee={fee}
                    to={newAddress}
                    source={selectedParentHash}
                    amount={amount}
                    open={open}
                    onClose={() => setOpen(false)}
                    isLoading={isLoading}
                    op={SEND}
                    symbol={symbol}
                />
            )}
        </Container>
    );
}

export default Send;
