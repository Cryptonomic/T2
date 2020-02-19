import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import { OperationKindType } from 'conseiljs';

import InputAddress from '../../../components/InputAddress';
import Fees from '../../../components/Fees';
import PasswordInput from '../../../components/PasswordInput';
import TezosNumericInput from '../../../components/TezosNumericInput';
import DelegateLedgerConfirmationModal from '../../../components/ConfirmModals/DelegateLedgerConfirmationModal';

import InputError from '../../BabylonDelegation/components/InputError';

import { useFetchFees } from '../../../reduxContent/app/thunks';
import { setIsLoadingAction } from '../../../reduxContent/app/actions';
import { transferThunk } from '../duck/thunks';

import { AVERAGEFEES } from '../../../constants/FeeValue';
import { RootState, AppState } from '../../../types/store';
import {
  Container,
  AmountContainer,
  FeeContainer,
  PasswordButtonContainer,
  InvokeButton,
  RowContainer
} from './style';

interface Props {
  isReady: boolean;
  balance: number;
}

function Send(props: Props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [fee, setFee] = useState(AVERAGEFEES.high);
  const [newAddress, setAddress] = useState('');
  const [passPhrase, setPassPhrase] = useState('');
  const [isAddressIssue, setIsAddressIssue] = useState(false);
  const [amount, setAmount] = useState('');
  const [open, setOpen] = useState(false);
  const { newFees, miniFee, isFeeLoaded } = useFetchFees(OperationKindType.Transaction, true);

  const { isLoading, isLedger, selectedAccountHash } = useSelector<RootState, AppState>(
    (state: RootState) => state.app,
    shallowEqual
  );

  const { isReady, balance } = props;

  useEffect(() => {
    setFee(newFees.high);
  }, [isFeeLoaded]);

  const isDisabled =
    !isReady || isLoading || isAddressIssue || !newAddress || (!passPhrase && !isLedger);

  function getBalanceState() {
    const realAmount = !amount ? Number(amount) : 0;
    const max = balance - fee;

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

  async function onSend() {
    dispatch(setIsLoadingAction(true));

    if (isLedger) {
      setOpen(true);
    }

    await dispatch(transferThunk(newAddress, amount, fee, passPhrase));
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
          <TezosNumericInput
            decimalSeparator={t('general.decimal_separator')}
            label={t('general.nouns.amount')}
            amount={amount}
            onChange={val => setAmount(val)}
            errorText={error}
          />
        </AmountContainer>
        <FeeContainer>
          <Fees
            low={newFees.low}
            medium={newFees.medium}
            high={newFees.high}
            fee={fee}
            miniFee={miniFee}
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
        <InvokeButton buttonTheme="primary" disabled={isDisabled} onClick={() => onSend()}>
          {t('general.verbs.send')}
        </InvokeButton>
      </PasswordButtonContainer>
      {isLedger && open && (
        <DelegateLedgerConfirmationModal
          fee={fee}
          address={newAddress}
          source={selectedAccountHash}
          open={open}
          onClose={() => setOpen(false)}
          isLoading={isLoading}
        />
      )}
    </Container>
  );
}

export default Send;
