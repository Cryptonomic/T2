import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { OperationKindType } from 'conseiljs';

import InputAddress from '../../../components/InputAddress';
import Fees from '../../../components/Fees';
import PasswordInput from '../../../components/PasswordInput';
import TezosNumericInput from '../../../components/TezosNumericInput';
import TokenLedgerConfirmationModal from '../../../components/ConfirmModals/TokenLedgerConfirmationModal';

import InputError from '../../../components/InputError';

import { useFetchFees } from '../../../reduxContent/app/thunks';
import { setIsLoadingAction } from '../../../reduxContent/app/actions';
import { mintThunk } from '../../duck/thunks';

import { MINT } from '../../../constants/TabConstants';
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
  symbol: string;
}

function Mint(props: Props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [fee, setFee] = useState(AVERAGEFEES.high);
  const [newAddress, setAddress] = useState('');
  const [passPhrase, setPassPhrase] = useState('');
  const [isAddressIssue, setIsAddressIssue] = useState(false);
  const [amount, setAmount] = useState('');
  const [open, setOpen] = useState(false);
  const { newFees, miniFee, isFeeLoaded } = useFetchFees(OperationKindType.Transaction, false);

  const { isLoading, isLedger, selectedParentHash } = useSelector<RootState, AppState>(
    (state: RootState) => state.app,
    shallowEqual
  );

  const { isReady, balance, symbol } = props;

  useEffect(() => {
    setFee(newFees.high);
  }, [isFeeLoaded]);

  const isDisabled =
    !isReady || isLoading || isAddressIssue || !newAddress || (!passPhrase && !isLedger);

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

  async function onAction() {
    dispatch(setIsLoadingAction(true));

    if (isLedger) {
      setOpen(true);
    }

    await dispatch(mintThunk(newAddress, amount, fee, passPhrase));
    setOpen(false);
    dispatch(setIsLoadingAction(false));
  }

  function onEnterPress(keyVal) {
    if (keyVal === 'Enter' && !isDisabled) {
      onAction();
    }
  }

  const { isIssue, warningMessage } = getBalanceState();
  const error = isIssue ? <InputError error={warningMessage} /> : '';

  return (
    <Container onKeyDown={event => onEnterPress(event.key)}>
      <RowContainer>
        <InputAddress
          label={t('components.send.holder_address')}
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
            symbol={symbol}
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
            containerStyle={{ width: '47%', marginTop: '10px' }}
          />
        )}
        <InvokeButton buttonTheme="primary" disabled={isDisabled} onClick={() => onAction()}>
          {t('general.verbs.mint')}
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
          op={MINT}
          symbol={symbol}
        />
      )}
    </Container>
  );
}

export default Mint;
