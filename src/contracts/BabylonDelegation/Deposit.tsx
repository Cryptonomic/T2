import React, { useState, useEffect } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation, WithTranslation } from 'react-i18next';
import { OperationKindType } from 'conseiljs';

import TezosNumericInput from '../../components/TezosNumericInput';
import Fees from '../../components/Fees';
import PasswordInput from '../../components/PasswordInput';
import WithdrawLedgerConfirmationModal from '../../components/ConfirmModals/WithdrawLedgerConfirmationModal';
import InputError from './InputError';
import TezosIcon from '../../components/TezosIcon';

import { ms } from '../../styles/helpers';
import { getIsRevealThunk, fetchFeesThunk } from '../../reduxContent/app/thunks';
import { withdrawThunk, depositThunk } from '../../reduxContent/invoke/thunks';
import { setIsLoadingAction } from '../../reduxContent/app/actions';

import { OPERATIONFEE } from '../../constants/FeeValue';
import { RootState } from '../../types/store';
import { RegularAddress, AverageFees } from '../../types/general';

import {
  Container,
  AmountContainer,
  FeeContainer,
  UseMax,
  PasswordButtonContainer,
  InvokeButton,
  WarningContainer,
  InfoText
} from './style';

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
  selectedParentHash: string;
  fetchFees: (op: string) => Promise<AverageFees>;
  getIsReveal: () => Promise<boolean>;
  deposit: (fee: number, amount: string, password: string, selectedAccountHash: string) => boolean;
  setIsLoading: (flag: boolean) => void;
}

type Props = OwnProps & StoreProps & WithTranslation;

function Deposit(props: Props) {
  const [averageFees, setAverageFees] = useState({
    low: 1420,
    medium: 2840,
    high: 5680
  });
  const [fee, setFee] = useState(averageFees.medium);
  const [amount, setAmount] = useState('');
  const [passPhrase, setPassPhrase] = useState('');
  const [open, setOpen] = useState(false);
  const {
    isReady,
    isLoading,
    isLedger,
    selectedAccountHash,
    selectedParentHash,
    addresses,
    fetchFees,
    deposit,
    setIsLoading,
    onSuccess,
    t
  } = props;

  async function getFees() {
    const newFees = await fetchFees(OperationKindType.Transaction);
    if (newFees.low < OPERATIONFEE) {
      newFees.low = OPERATIONFEE;
      setAverageFees(newFees);
      setFee(newFees.medium);
    }
  }

  useEffect(() => {
    getFees();
  }, [selectedAccountHash]);

  function onGetMax() {
    const max = addresses[0].balance - fee;
    let newAmount = '0';
    if (max > 0) {
      newAmount = (max / utez).toFixed(6);
    }
    setAmount(newAmount);
  }

  function getBalanceState() {
    const realAmount = !amount ? Number(amount) : 0;
    const max = addresses[0].balance - fee;

    if (max <= 0 || max < realAmount) {
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

  async function onInvokeOperation() {
    setIsLoading(true);
    if (isLedger) {
      setOpen(true);
    }

    const operationResult = await deposit(fee, amount, passPhrase, selectedAccountHash);

    setOpen(false);
    setIsLoading(false);

    if (operationResult) {
      onSuccess();
    }
  }

  function onEnterPress(keyVal, disabled) {
    if (keyVal === 'Enter' && !disabled) {
      onInvokeOperation();
    }
  }

  const { isIssue, warningMessage } = getBalanceState();
  const isDisabled =
    !isReady || isLoading || isIssue || amount === '0' || !amount || (!passPhrase && !isLedger);

  const error = isIssue ? <InputError error={warningMessage} /> : '';

  const warningTxt = t('components.withdrawDeposit.deposit_warning', {
    managerAddress: selectedParentHash
  });

  return (
    <Container onKeyDown={event => onEnterPress(event.key, isDisabled)}>
      <AmountContainer>
        <TezosNumericInput
          decimalSeparator={t('general.decimal_separator')}
          label={t('general.nouns.amount')}
          amount={amount}
          onChange={val => setAmount(val)}
          errorText={error}
        />
        <UseMax onClick={onGetMax}>{t('general.verbs.use_max')}</UseMax>
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
      <WarningContainer>
        <TezosIcon iconName="info" size={ms(5)} color="info" />
        <InfoText>{warningTxt}</InfoText>
      </WarningContainer>

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

const mapStateToProps = (state: RootState) => ({
  isLoading: state.app.isLoading,
  isLedger: state.app.isLedger,
  selectedAccountHash: state.app.selectedAccountHash,
  selectedParentHash: state.app.selectedParentHash
});

const mapDispatchToProps = dispatch => ({
  setIsLoading: (flag: boolean) => dispatch(setIsLoadingAction(flag)),
  fetchFees: (op: OperationKindType) => dispatch(fetchFeesThunk(op)),
  getIsReveal: () => dispatch(getIsRevealThunk()),
  deposit: (fee: number, amount: string, password: string, selectedAccountHash: string) =>
    dispatch(depositThunk(fee, amount, password, selectedAccountHash)),
  withdraw: (fee: number, amount: string, password: string) =>
    dispatch(withdrawThunk(fee, amount, password))
});

export default compose(
  withTranslation(),
  connect(mapStateToProps, mapDispatchToProps)
)(Deposit) as React.ComponentType<OwnProps>;
