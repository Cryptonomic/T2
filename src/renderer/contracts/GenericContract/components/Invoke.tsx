import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import MenuItem from '@mui/material/MenuItem';
import { TezosParameterFormat, OperationKindType } from 'conseiljs';

import TezosNumericInput from '../../../components/TezosNumericInput';
import TextField from '../../../components/TextField';
import Fees from '../../../components/Fees';
import PasswordInput from '../../../components/PasswordInput';
import InvokeLedgerConfirmationModal from '../../../components/ConfirmModals/InvokeLedgerConfirmationModal';
import FormatSelector from '../../../components/FormatSelector';

import { useFetchFees } from '../../../reduxContent/app/thunks';
import { invokeAddressThunk } from '../../../contracts/duck/thunks';
import { setIsLoadingAction } from '../../../reduxContent/app/actions';

import { OPERATIONFEE, AVERAGEFEES } from '../../../constants/FeeValue';
import { RootState, AppState } from '../../../types/store';
import { RegularAddress } from '../../../types/general';

import { Container, UseMax, PasswordButtonContainer, InvokeButton, RowContainer } from './style';

export const InvokeAddressContainer = styled.div`
    width: 100%;
    display: flex;
    height: 64px;
    margin-top: 20px;
`;

export const ParametersContainer = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    height: 64px;
    width: 100%;
`;

export const ColStorage = styled.div`
    flex: 1;
`;

export const ColFormat = styled.div`
    min-width: 19%;
    margin-left: 80px;
`;

export const ItemWrapper = styled(MenuItem)`
    &&& {
        &[class*='selected'] {
            color: ${({ theme: { colors } }) => colors.primary};
        }
        width: 100%;
        font-size: 16px;
        font-weight: 300;
    }
`;

export const SpaceBar = styled.div`
    height: 16px;
    width: 2px;
    margin: 0 4px 0 7px;
    background-color: ${({ theme: { colors } }) => colors.primary};
`;

export const ColContainer = styled.div`
    width: 45%;
`;

export const AmountContainer = styled.div`
    width: 45%;
    position: relative;
`;

export const FeeContainer = styled.div`
    width: 45%;
    display: flex;
    height: 64px;
`;

const utez = 1000000;

interface Props {
    isReady: boolean;
    addresses: RegularAddress[];
    onSuccess: () => void;
}

function Invoke(props: Props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [fee, setFee] = useState(AVERAGEFEES.medium);
    const [gas, setGas] = useState(0);
    const [storage, setStorage] = useState(0);
    const [selected, setSelected] = useState(0);
    const [amount, setAmount] = useState('0');
    const [passPhrase, setPassPhrase] = useState('');
    const [parameters, setParameters] = useState('');
    const [codeFormat, setCodeFormat] = useState<TezosParameterFormat>(TezosParameterFormat.Micheline);
    const [entryPoint, setEntryPoint] = useState('');
    const [open, setOpen] = useState(false);

    const { newFees, isFeeLoaded } = useFetchFees(OperationKindType.Transaction, false);
    const { isLoading, isLedger, selectedAccountHash } = useSelector<RootState, AppState>((state: RootState) => state.app, shallowEqual);

    const { isReady, addresses, onSuccess } = props;

    const isDisabled = !isReady || isLoading || !amount || (!passPhrase && !isLedger);
    const selectedInvokeAddress = addresses[selected].pkh;

    useEffect(() => {
        setFee(newFees.medium);
    }, [isFeeLoaded]);

    function onUseMax() {
        const balance = addresses[selected].balance;
        const max = balance - fee - gas - storage;
        let newAmount = '0';
        if (max > 0) {
            newAmount = (max / utez).toFixed(6);
        }
        setAmount(newAmount);
    }

    function onChangeInvokeAddress(event) {
        // const pkh = event.target.value;
        // const address = addresses.find(address => address.pkh === pkh);
        // this.setState({ selectedInvokeAddress: pkh, balance: address.balance });
    }

    function onEnterPress(keyVal) {
        if (keyVal === 'Enter' && !isDisabled) {
            onInvokeOperation();
        }
    }

    async function onInvokeOperation() {
        dispatch(setIsLoadingAction(true));
        if (isLedger) {
            setOpen(true);
        }

        const operationResult = await dispatch(
            invokeAddressThunk(selectedAccountHash, fee, amount, storage, gas, parameters, passPhrase, selectedInvokeAddress, entryPoint, codeFormat)
        );
        setOpen(false);
        dispatch(setIsLoadingAction(false));

        if (!!operationResult) {
            onSuccess();
        }
    }

    return (
        <Container onKeyDown={(event) => onEnterPress(event.key)}>
            <ParametersContainer>
                <ColStorage>
                    <TextField label={t('components.interactModal.parameters')} onChange={(val) => setParameters(val)} />
                </ColStorage>
                <ColFormat>
                    <FormatSelector value={codeFormat} onChange={(val) => setCodeFormat(val)} />
                </ColFormat>
            </ParametersContainer>
            <ParametersContainer>
                <TextField label={t('components.interactModal.entry_point')} onChange={(val) => setEntryPoint(val)} />
            </ParametersContainer>
            <RowContainer>
                <ColContainer>
                    <TextField type="number" label={t('components.interactModal.storage_limit')} onChange={(val) => setStorage(Number(val))} />
                </ColContainer>
                <ColContainer>
                    <TextField type="number" label={t('components.interactModal.gas_limit')} onChange={(val) => setGas(Number(val))} />
                </ColContainer>
            </RowContainer>
            <RowContainer>
                <AmountContainer>
                    <TezosNumericInput
                        decimalSeparator={t('general.decimal_separator')}
                        label={t('general.nouns.amount')}
                        amount={amount}
                        onChange={(val) => setAmount(val)}
                    />
                    <UseMax onClick={onUseMax}>{t('general.verbs.use_max')}</UseMax>
                </AmountContainer>
                <FeeContainer>
                    <Fees low={newFees.low} medium={newFees.medium} high={newFees.high} fee={fee} miniFee={OPERATIONFEE} onChange={(val) => setFee(val)} />
                </FeeContainer>
            </RowContainer>

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
                    {t('general.verbs.invoke')}
                </InvokeButton>
            </PasswordButtonContainer>

            {isLedger && open && (
                <InvokeLedgerConfirmationModal
                    amount={amount}
                    fee={fee}
                    parameters={parameters}
                    storage={storage}
                    address={selectedAccountHash}
                    source={selectedInvokeAddress}
                    open={open}
                    onClose={() => setOpen(false)}
                    isLoading={isLoading}
                />
            )}
        </Container>
    );
}

export default Invoke;
