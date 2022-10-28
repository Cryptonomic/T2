import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { OperationKindType } from 'conseiljs';

import TezosNumericInput from '../../../components/TezosNumericInput';
import Fees from '../../../components/Fees';
import PasswordInput from '../../../components/PasswordInput';
import WithdrawLedgerConfirmationModal from '../../../components/ConfirmModals/WithdrawLedgerConfirmationModal';
import TezosIcon from '../../../components/TezosIcon';
import InputError from '../../../components/InputError';

import { ms } from '../../../styles/helpers';
import { useFetchFees } from '../../../reduxContent/app/thunks';
import { setIsLoadingAction } from '../../../reduxContent/app/actions';

import { OPERATIONFEE, AVERAGEFEES } from '../../../constants/FeeValue';
import { RootState, AppState } from '../../../types/store';
import { RegularAddress } from '../../../types/general';

import { depositThunk } from '../../duck/thunks';

import { Container, AmountContainer, FeeContainer, UseMax, PasswordButtonContainer, InvokeButton, WarningContainer, InfoText } from './style';

const utez = 1000000;

interface Props {
    isReady: boolean;
    addresses: RegularAddress[];
    onSuccess: () => void;
}

function Deposit(props: Props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [fee, setFee] = useState(5000);
    const [amount, setAmount] = useState('');
    const [passPhrase, setPassPhrase] = useState('');
    const [open, setOpen] = useState(false);

    const { newFees } = useFetchFees(OperationKindType.Transaction, false);
    const { isLoading, isLedger, selectedAccountHash, selectedParentHash } = useSelector<RootState, AppState>((state: RootState) => state.app, shallowEqual);
    const { isReady, addresses, onSuccess } = props;

    function onGetMax() {
        const max = addresses[0].balance - fee - 3_000_000;
        const newAmount = max > 0 ? (max / utez).toFixed(6) : '0';
        setAmount(newAmount);
    }

    function getBalanceState() {
        const realAmount = !amount ? Number(amount) : 0;
        const max = addresses[0].balance - fee - 3_000_000;

        if (max <= 0 || max < realAmount) {
            return {
                isIssue: true,
                warningMessage: t('components.send.warnings.total_exceeds'),
            };
        }

        return {
            isIssue: false,
            warningMessage: '',
        };
    }

    async function onInvokeOperation() {
        dispatch(setIsLoadingAction(true));
        if (isLedger) {
            setOpen(true);
        }

        const operationResult = await dispatch(depositThunk(fee, amount, passPhrase, selectedAccountHash));

        setOpen(false);
        dispatch(setIsLoadingAction(false));

        if (!!operationResult) {
            onSuccess();
        }
    }

    function onEnterPress(keyVal, disabled) {
        if (keyVal === 'Enter' && !disabled) {
            onInvokeOperation();
        }
    }

    const { isIssue, warningMessage } = getBalanceState();
    const isDisabled = !isReady || isLoading || isIssue || amount === '0' || !amount || (!passPhrase && !isLedger);

    const error = isIssue ? <InputError error={warningMessage} /> : '';

    const warningTxt = t('components.withdrawDeposit.deposit_warning', {
        managerAddress: selectedParentHash,
    });

    return (
        <Container onKeyDown={(event) => onEnterPress(event.key, isDisabled)}>
            <AmountContainer>
                <TezosNumericInput
                    decimalSeparator={t('general.decimal_separator')}
                    label={t('general.nouns.amount')}
                    amount={amount}
                    onChange={(val) => setAmount(val)}
                    errorText={error}
                />
                <UseMax onClick={onGetMax}>{t('general.verbs.use_max')}</UseMax>
            </AmountContainer>
            <FeeContainer>
                <Fees low={newFees.low} medium={newFees.medium} high={newFees.high} fee={fee} miniFee={OPERATIONFEE} onChange={(val) => setFee(val)} />
            </FeeContainer>
            <WarningContainer>
                <TezosIcon iconName="info" size={ms(5)} color="info" />
                <InfoText>{warningTxt}</InfoText>
            </WarningContainer>

            <PasswordButtonContainer>
                {!isLedger && (
                    <PasswordInput
                        label={t('general.nouns.wallet_password')}
                        password={passPhrase}
                        onChange={(val) => setPassPhrase(val)}
                        containerStyle={{ width: '60%', marginTop: '10px' }}
                    />
                )}
                <InvokeButton buttonTheme="primary" disabled={isDisabled} onClick={() => onInvokeOperation()}>
                    {t('general.verbs.deposit')}
                </InvokeButton>
            </PasswordButtonContainer>
            {isLedger && open && (
                <WithdrawLedgerConfirmationModal
                    amount={amount}
                    fee={fee}
                    source={selectedAccountHash}
                    open={open}
                    onClose={() => setOpen(false)}
                    isLoading={isLoading}
                />
            )}
        </Container>
    );
}

export default Deposit;
