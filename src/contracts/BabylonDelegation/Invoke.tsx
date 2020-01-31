import React, { useState, useEffect } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import MenuItem from '@material-ui/core/MenuItem';
import { withTranslation, WithTranslation } from 'react-i18next';
import { TezosParameterFormat, OperationKindType } from 'conseiljs';

import Button from '../../components/Button';
import TezosNumericInput from '../../components/TezosNumericInput';
import TextField from '../../components/TextField';
import Fees from '../../components/Fees';
import PasswordInput from '../../components/PasswordInput';
import InvokeLedgerConfirmationModal from '../../components/ConfirmModals/InvokeLedgerConfirmationModal';
import FormatSelector from '../../components/FormatSelector';

import { fetchFeesThunk } from '../../reduxContent/app/thunks';
import { invokeAddressThunk } from '../../reduxContent/invoke/thunks';
import { setIsLoadingAction } from '../../reduxContent/app/actions';

import { OPERATIONFEE } from '../../constants/FeeValue';
import { RootState } from '../../types/store';
import { RegularAddress, AverageFees } from '../../types/general';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 0 20px 20px 20px;
  position: relative;
`;

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

export const RowContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
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

export const UseMax = styled.div`
  position: absolute;
  right: 23px;
  top: 24px;
  font-size: 12px;
  font-weight: 500;
  display: block;
  color: ${({ theme: { colors } }) => colors.accent};
  cursor: pointer;
`;

export const PasswordButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 40px 15px 0px;
  height: 100px;
  margin-top: auto;
  width: 100%;
`;

export const InvokeButton = styled(Button)`
  width: 194px;
  height: 50px;
  margin-bottom: 10px;
  margin-left: auto;
  padding: 0;
`;

const utez = 1000000;

interface OwnProps {
  isReady: boolean;
  addresses: RegularAddress[];
  onSuccess: () => void;
}

interface StoreProps {
  isLedger: boolean;
  isLoading: boolean;
  selectedAccountHash: string;
  fetchFees: (op: OperationKindType) => Promise<AverageFees>;
  setIsLoading: (flag: boolean) => Promise<boolean>;
  invokeAddress: (
    address: string,
    fee: number,
    amount: string,
    storage: number,
    gas: number,
    parameters: string,
    password: string,
    selectedInvokeAddress: string,
    entryPoint: string,
    format: TezosParameterFormat
  ) => Promise<boolean>;
}

type Props = OwnProps & StoreProps & WithTranslation;

function Invoke(props: Props) {
  const {
    isReady,
    isLoading,
    isLedger,
    addresses,
    fetchFees,
    selectedAccountHash,
    t,
    setIsLoading,
    invokeAddress,
    onSuccess
  } = props;
  const [averageFees, setAverageFees] = useState({
    low: 1420,
    medium: 2840,
    high: 5680
  });
  const [fee, setFee] = useState(averageFees.medium);
  const [gas, setGas] = useState(0);
  const [storage, setStorage] = useState(0);
  const [selected, setSelected] = useState(0);
  const [amount, setAmount] = useState('0');
  const [passPhrase, setPassPhrase] = useState('');
  const [parameters, setParameters] = useState('');
  const [codeFormat, setCodeFormat] = useState<TezosParameterFormat>(
    TezosParameterFormat.Micheline
  );
  const [entryPoint, setEntryPoint] = useState('');
  const [open, setOpen] = useState(false);

  const isDisabled = !isReady || isLoading || !amount || (!passPhrase && !isLedger);
  const selectedInvokeAddress = addresses[selected].pkh;

  async function getFees() {
    const newFees = await fetchFees(OperationKindType.Transaction);
    if (newFees.low < OPERATIONFEE) {
      newFees.low = OPERATIONFEE;
    }
    setAverageFees({ ...newFees });
    setFee(newFees.medium);
  }

  useEffect(() => {
    getFees();
  }, [selectedAccountHash]);

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
    setIsLoading(true);

    if (isLedger) {
      setOpen(true);
    }

    const operationResult = await invokeAddress(
      selectedAccountHash,
      fee,
      amount,
      storage,
      gas,
      parameters,
      passPhrase,
      selectedInvokeAddress,
      entryPoint,
      codeFormat
    ).catch(err => {
      console.error(err);
      return false;
    });
    setOpen(false);
    setIsLoading(false);

    if (operationResult) {
      onSuccess();
    }
  }

  return (
    <Container onKeyDown={event => onEnterPress(event.key)}>
      <ParametersContainer>
        <ColStorage>
          <TextField
            label={t('components.interactModal.parameters')}
            onChange={val => setParameters(val)}
          />
        </ColStorage>
        <ColFormat>
          <FormatSelector value={codeFormat} onChange={val => setCodeFormat(val)} />
        </ColFormat>
      </ParametersContainer>
      <ParametersContainer>
        <TextField
          label={t('components.interactModal.entry_point')}
          onChange={val => setEntryPoint(val)}
        />
      </ParametersContainer>
      <RowContainer>
        <ColContainer>
          <TextField
            type="number"
            label={t('components.interactModal.storage_limit')}
            onChange={val => setStorage(Number(val))}
          />
        </ColContainer>
        <ColContainer>
          <TextField
            type="number"
            label={t('components.interactModal.gas_limit')}
            onChange={val => setGas(Number(val))}
          />
        </ColContainer>
      </RowContainer>
      <RowContainer>
        <AmountContainer>
          <TezosNumericInput
            decimalSeparator={t('general.decimal_separator')}
            label={t('general.nouns.amount')}
            amount={amount}
            onChange={val => setAmount(val)}
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
            onChange={val => setFee(val)}
          />
        </FeeContainer>
      </RowContainer>

      <PasswordButtonContainer>
        {!isLedger && (
          <PasswordInput
            label={t('general.nouns.wallet_password')}
            password={passPhrase}
            onChange={val => setPassPhrase(val)}
            containerStyle={{ width: '60%', marginTop: '10px' }}
          />
        )}
        <InvokeButton
          buttonTheme="primary"
          disabled={isDisabled}
          onClick={() => onInvokeOperation()}
        >
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

const mapStateToProps = (state: RootState) => ({
  isLoading: state.app.isLoading,
  isLedger: state.app.isLedger,
  selectedAccountHash: state.app.selectedAccountHash
});

const mapDispatchToProps = dispatch => ({
  setIsLoading: (flag: boolean) => dispatch(setIsLoadingAction(flag)),
  fetchFees: (op: OperationKindType) => dispatch(fetchFeesThunk(op)),
  invokeAddress: (
    address: string,
    fee: number,
    amount: string,
    storage: number,
    gas: number,
    parameters: string,
    password: string,
    selectedInvokeAddress: string,
    entryPoint: string,
    format: TezosParameterFormat
  ) =>
    dispatch(
      invokeAddressThunk(
        address,
        fee,
        amount,
        storage,
        gas,
        parameters,
        password,
        entryPoint,
        selectedInvokeAddress,
        format
      )
    )
});

export default compose(
  withTranslation(),
  connect(mapStateToProps, mapDispatchToProps)
)(Invoke) as React.ComponentType<OwnProps>;
