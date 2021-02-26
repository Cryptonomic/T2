import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { TezosParameterFormat } from 'conseiljs';
import TextField from '../TextField';
import TezosNumericInput from '../TezosNumericInput';
import { ms } from '../../styles/helpers';
import Fees from '../Fees';
import PasswordInput from '../PasswordInput';
import InputAddress from '../InputAddress';
import InvokeLedgerConfirmationModal from '../ConfirmModals/InvokeLedgerConfirmationModal';
import FormatSelector from '../FormatSelector';

import { setIsLoadingAction } from '../../reduxContent/app/actions';
import { invokeAddressThunk } from '../../contracts/duck/thunks';

import { OPERATIONFEE } from '../../constants/FeeValue';
import { openBlockExplorerForOperation } from '../../utils/general';

import { RegularAddress, AverageFees } from '../../types/general';
import { RootState } from '../../types/store';

import {
    MainContainer,
    TabContainer,
    InputAddressContainer,
    ParametersContainer,
    RowContainer,
    ColContainer,
    AmountContainer,
    FeeContainer,
    PasswordButtonContainer,
    InvokeButton,
    UseMax,
    ViewScan,
    LinkIcon,
    StorageFormatContainer,
    ColFormat,
    ColStorage,
} from './style';

const utez = 1000000;

interface Props {
    averageFees: AverageFees;
    addresses: RegularAddress[];
    enterNum: number;
    onClose: () => void;
}

const defaultState = {
    isAddressIssue: false,
    contractAddress: '',
    selectedInvokeAddress: '',
    gas: 0,
    storage: 0,
    fee: 2840,
    amount: '0',
    parameters: '',
    passPhrase: '',
    isOpenLedgerConfirm: false,
    codeFormat: TezosParameterFormat.Micheline,
    entryPoint: '',
};

function InvokeContract(props: Props) {
    const { averageFees, addresses, enterNum, onClose } = props;
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const { isLoading, isLedger } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
    const [state, setState] = useState(() => {
        return {
            ...defaultState,
            selectedInvokeAddress: addresses[0].pkh,
            balance: addresses[0].balance,
            fee: averageFees.medium,
        };
    });
    const {
        fee,
        gas,
        balance,
        storage,
        amount,
        parameters,
        passPhrase,
        isOpenLedgerConfirm,
        codeFormat,
        entryPoint,
        isAddressIssue,
        contractAddress,
        selectedInvokeAddress,
    } = state;

    const isDisabled = isAddressIssue || isLoading || !amount || !contractAddress || (!passPhrase && !isLedger);

    function updateState(updatedValues) {
        setState((prevState) => {
            return { ...prevState, ...updatedValues };
        });
    }

    function onUseMax() {
        const max = balance - fee - gas - storage;
        let newAmount = '0';
        if (max > 0) {
            newAmount = (max / utez).toFixed(6);
        }
        updateState({ amount: newAmount });
    }

    // function onChangeInvokeAddress(event) {
    //   const pkh = event.target.value;
    //   const address = addresses.find(address => address.pkh === pkh);
    //   updateState({ selectedInvokeAddress: pkh, balance: address.balance });
    // };

    function updatePassPhrase(val) {
        updateState({ passPhrase: val });
    }

    function onLedgerConfirmation(val) {
        updateState({ isOpenLedgerConfirm: val });
    }

    function onOpenLink(link) {
        openBlockExplorerForOperation(link);
    }

    async function onInvokeOperation() {
        if (isDisabled) {
            return;
        }
        dispatch(setIsLoadingAction(true));
        if (isLedger) {
            onLedgerConfirmation(true);
        }

        const isOperationCompleted = await dispatch(
            invokeAddressThunk(contractAddress, fee, amount, storage, gas, parameters, passPhrase, selectedInvokeAddress, entryPoint, codeFormat)
        );

        onLedgerConfirmation(false);
        dispatch(setIsLoadingAction(false));
        if (!!isOperationCompleted) {
            onClose();
        }
    }

    useEffect(() => {
        updateState({ fee: averageFees.medium });
    }, [averageFees]);

    useEffect(() => {
        if (enterNum !== 0) {
            onInvokeOperation();
        }
    }, [enterNum]);

    return (
        <MainContainer>
            <TabContainer>
                <InputAddressContainer>
                    <InputAddress
                        operationType="invoke"
                        label={t('components.interactModal.smart_address')}
                        onChange={(val) => updateState({ contractAddress: val })}
                        onIssue={(status) => updateState({ isAddressIssue: status })}
                    />
                    {!isAddressIssue && contractAddress && (
                        <React.Fragment>
                            <ViewScan onClick={() => onOpenLink(contractAddress)}>{t('components.interactModal.view_scan')}</ViewScan>
                            <LinkIcon iconName="new-window" size={ms(-1)} color="primary" onClick={() => onOpenLink(contractAddress)} />
                        </React.Fragment>
                    )}
                </InputAddressContainer>
                <StorageFormatContainer>
                    <ColStorage>
                        <TextField label={t('components.interactModal.parameters')} onChange={(val) => updateState({ parameters: val })} />
                    </ColStorage>
                    <ColFormat>
                        <FormatSelector value={codeFormat} onChange={(val) => updateState({ codeFormat: val })} />
                    </ColFormat>
                </StorageFormatContainer>
                <ParametersContainer>
                    <TextField label={t('components.interactModal.entry_point')} onChange={(val) => updateState({ entryPoint: val })} />
                </ParametersContainer>

                <RowContainer>
                    <ColContainer>
                        <TextField
                            type="number"
                            label={t('components.interactModal.storage_limit')}
                            onChange={(val) => updateState({ storage: Number(val) })}
                        />
                    </ColContainer>
                    <ColContainer>
                        <TextField type="number" label={t('components.interactModal.gas_limit')} onChange={(val) => updateState({ gas: Number(val) })} />
                    </ColContainer>
                </RowContainer>
                <RowContainer>
                    <AmountContainer>
                        <TezosNumericInput
                            decimalSeparator={t('general.decimal_separator')}
                            label={t('general.nouns.amount')}
                            amount={amount}
                            onChange={(val) => updateState({ amount: val })}
                        />
                        <UseMax onClick={onUseMax}>{t('general.verbs.use_max')}</UseMax>
                    </AmountContainer>
                    <FeeContainer>
                        <Fees
                            low={averageFees.low}
                            medium={averageFees.medium}
                            high={averageFees.high}
                            fee={fee}
                            miniFee={OPERATIONFEE}
                            onChange={(val) => updateState({ fee: val })}
                        />
                    </FeeContainer>
                </RowContainer>
            </TabContainer>
            <PasswordButtonContainer>
                {!isLedger && (
                    <PasswordInput
                        label={t('general.nouns.wallet_password')}
                        password={passPhrase}
                        onChange={updatePassPhrase}
                        containerStyle={{ width: '60%', marginTop: '10px' }}
                    />
                )}
                <InvokeButton buttonTheme="primary" disabled={isDisabled} onClick={onInvokeOperation}>
                    {t('general.verbs.invoke')}
                </InvokeButton>
            </PasswordButtonContainer>
            {isLedger && isOpenLedgerConfirm && (
                <InvokeLedgerConfirmationModal
                    amount={amount}
                    fee={fee}
                    parameters={parameters}
                    storage={storage}
                    address={contractAddress}
                    source={selectedInvokeAddress}
                    open={isOpenLedgerConfirm}
                    onClose={() => onLedgerConfirmation(false)}
                    isLoading={isLoading}
                />
            )}
        </MainContainer>
    );
}

export default InvokeContract;
