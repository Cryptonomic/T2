import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { TezosParameterFormat } from 'conseiljs';
import TextField from '../TextField';
import CustomTextArea from '../CustomTextArea';
import TezosNumericInput from '../TezosNumericInput';
import { ms } from '../../styles/helpers';
import Fees from '../Fees';
import PasswordInput from '../PasswordInput';
import TezosAmount from '../TezosAmount';
import TezosAddress from '../TezosAddress';
import DeployLedgerConfirmationModal from '../ConfirmModals/DeployLedgerConfirmationModal';
import FormatSelector from '../FormatSelector';

import { setIsLoadingAction } from '../../reduxContent/app/actions';
import { originateContractThunk } from '../../reduxContent/originate/thunks';

import { OPERATIONFEE } from '../../constants/FeeValue';
import { RegularAddress, AverageFees } from '../../types/general';
import { RootState } from '../../types/store';

// import { openBlockExplorerForOperation } from '../../utils/general';

import {
    MainContainer,
    TabContainer,
    InputAddressContainer,
    ParametersContainer,
    DeployAddressContainer,
    DeployAddressLabel,
    DeployAddressContent,
    SpaceBar,
    RowContainer,
    ColContainer,
    AmountContainer,
    FeeContainer,
    PasswordButtonContainer,
    InvokeButton,
    UseMax,
    StorageFormatContainer,
    ColFormat,
    ColStorage,
} from './style';

// TODO: move to featureModals

const utez = 1000000; // TODO

interface Props {
    averageFees: AverageFees;
    addresses: RegularAddress[];
    enterNum: number;
    onClose: () => void;
}

const defaultState = {
    gas: 0,
    storage: 0,
    fee: 2840,
    amount: '0',
    parameters: '',
    passPhrase: '',
    isOpenLedgerConfirm: false,
    michelsonCode: '',
    delegate: '',
    codeFormat: TezosParameterFormat.Micheline,
};

function DeployContract(props: Props) {
    const { addresses, averageFees, enterNum, onClose } = props;

    const { t } = useTranslation();
    const dispatch = useDispatch();

    const { isLoading, isLedger, selectedParentHash } = useSelector((rootState: RootState) => rootState.app, shallowEqual);

    const [state, setState] = useState(() => {
        return {
            ...defaultState,
            fee: averageFees.medium,
        };
    });
    const { amount, fee, gas, storage, passPhrase, isOpenLedgerConfirm, parameters, michelsonCode, codeFormat, delegate } = state;

    const isDisabled = isLoading || !amount || (!passPhrase && !isLedger) || !parameters || !michelsonCode;

    function updateState(updatedValues) {
        setState((prevState) => {
            return { ...prevState, ...updatedValues };
        });
    }

    function onUseMax() {
        const { balance } = addresses[0];
        const max = balance - fee - gas - storage;
        let newAmount = '0';
        if (max > 0) {
            newAmount = (max / utez).toFixed(6);
        }
        updateState({ amount: newAmount });
    }

    function updatePassPhrase(val) {
        updateState({ passPhrase: val });
    }

    function onLedgerConfirmation(flag) {
        updateState({ isOpenLedgerConfirm: flag });
    }

    // function openLink (element) {
    //   openBlockExplorerForOperation(element);
    // }

    async function onDeployOperation() {
        if (isDisabled) {
            return;
        }
        dispatch(setIsLoadingAction(true));

        if (isLedger) {
            onLedgerConfirmation(true);
        }

        const { pkh } = addresses[0];
        const isOperationCompleted = await dispatch(
            originateContractThunk(delegate, amount, fee, passPhrase, pkh, storage, gas, michelsonCode, parameters, codeFormat, true)
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
            onDeployOperation();
        }
    }, [enterNum]);

    return (
        <MainContainer>
            <TabContainer>
                <InputAddressContainer>
                    <CustomTextArea
                        label={t('components.interactModal.paste_micheline_code', { format: codeFormat })}
                        onChange={(val) => updateState({ michelsonCode: val })}
                    />
                </InputAddressContainer>

                <StorageFormatContainer>
                    <ColStorage>
                        <TextField label={t('components.interactModal.initial_storage')} onChange={(val) => updateState({ parameters: val })} />
                    </ColStorage>
                    <ColFormat>
                        <FormatSelector value={codeFormat} onChange={(val) => updateState({ codeFormat: val })} />
                    </ColFormat>
                </StorageFormatContainer>
                <ParametersContainer>
                    <TextField label={t('general.verbs.delegate')} onChange={(val) => updateState({ delegate: val })} />
                </ParametersContainer>

                <DeployAddressContainer>
                    <DeployAddressLabel>{t('components.interactModal.deploy_from')}</DeployAddressLabel>
                    <DeployAddressContent>
                        <TezosAddress address={addresses[0].pkh} weight={300} size="16px" color="gray3" color2="primary" />
                        <SpaceBar />
                        <TezosAmount color="primary" size={ms(0.65)} amount={addresses[0].balance} />
                    </DeployAddressContent>
                </DeployAddressContainer>
                <RowContainer>
                    <ColContainer>
                        <TextField type="number" label={t('components.interactModal.storage_limit')} onChange={(val) => updateState({ storage: val })} />
                    </ColContainer>
                    <ColContainer>
                        <TextField type="number" label={t('components.interactModal.gas_limit')} onChange={(val) => updateState({ gas: val })} />
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
                <InvokeButton buttonTheme="primary" disabled={isDisabled} onClick={onDeployOperation}>
                    {t('general.verbs.deploy')}
                </InvokeButton>
            </PasswordButtonContainer>
            {isLedger && isOpenLedgerConfirm && (
                <DeployLedgerConfirmationModal
                    amount={amount}
                    fee={fee}
                    source={addresses[0].pkh}
                    parameters={parameters}
                    open={isOpenLedgerConfirm}
                    onClose={() => onLedgerConfirmation(false)}
                    isLoading={isLoading}
                />
            )}
        </MainContainer>
    );
}

export default DeployContract;
