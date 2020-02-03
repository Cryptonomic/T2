import React, { useState, useEffect } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { withTranslation, WithTranslation, Trans } from 'react-i18next';
import { OperationKindType } from 'conseiljs';

import Button from '../Button/';
import { ms } from '../../styles/helpers';
import SendConfirmationModal from '../ConfirmModals/SendConfirmationModal';
import SendLedgerConfirmationModal from '../ConfirmModals/SendLedgerConfirmationModal';
import InputAddress from '../InputAddress';
import TezosNumericInput from '../TezosNumericInput';
import TezosAmount from '../TezosAmount';
import TezosIcon from '../TezosIcon';
import TextField from '../TextField';
import Tooltip from '../Tooltip';
import Fees from '../Fees';

import {
  validateAmountThunk,
  sendTezThunk,
  sendDelegatedFundsThunk
} from '../../reduxContent/sendTezos/thunks';
import { depositThunk } from '../../reduxContent/invoke/thunks';

import { setIsLoadingAction } from '../../reduxContent/app/actions';
import {
  getIsRevealThunk,
  fetchFeesThunk,
  getIsImplicitAndEmptyThunk
} from '../../reduxContent/app/thunks';
import { OPERATIONFEE, REVEALOPERATIONFEE } from '../../constants/FeeValue';
import { RootState } from '../../types/store';
import { AddressType, AverageFees } from '../../types/general';

const SendContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 0 20px 20px 20px;
  position: relative;
`;

const SendTitle = styled.div`
  font-size: 24px;
  line-height: 34px;
  letter-spacing: 1px;
  font-weight: 300;
  color: ${({ theme: { colors } }) => colors.primary};
`;

const FeesBurnContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const BurnsContainer = styled.div`
  width: 45%;
  position: relative;
`;

const TextfieldTooltip = styled(Button)`
  position: absolute;
  left: 80px;
  top: 22px;
`;

const BurnTooltip = styled(TextfieldTooltip)`
  left: 80px;
`;
const FeeTooltip = styled(Button)`
  position: relative;
  top: 3px;
`;

const HelpIcon = styled(TezosIcon)`
  padding: 0 0 0 ${ms(-4)};
`;

const TezosIconInput = styled(TezosIcon)`
  position: absolute;
  left: 70px;
  top: 25px;
  display: block;
`;

const TooltipContainer = styled.div`
  padding: 10px;
  color: #000;
  font-size: 14px;
  max-width: 312px;

  .customArrow .rc-tooltip-arrow {
    left: 66%;
  }
`;

const TooltipTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme: { colors } }) => colors.primary};
`;

const TooltipContent = styled.div`
  margin-top: 8px;
  font-size: 14px;
  line-height: 21px;
  width: 270px;
  font-weight: 300;
  color: ${({ theme: { colors } }) => colors.black};
`;

const BoldSpan = styled.span`
  font-weight: 500;
`;

const SendButton = styled(Button)`
  margin-left: auto;
  width: 194px;
  height: 50px;
`;

const InputAmount = styled.div`
  position: relative;
  width: 100%;
`;

const FeeContainer = styled.div`
  position: relative;
  width: 45%;
  display: flex;
  height: 64px;
`;

const TotalContent = styled.div``;

const BalanceContent = styled.div`
  margin-left: 40px;
`;

const UseMax = styled.div`
  position: absolute;
  right: 23px;
  top: 25px;
  font-size: 12px;
  font-weight: 500;
  display: block;
  color: ${({ theme: { colors } }) => colors.accent};
  cursor: pointer;
`;
const TotalAmount = styled(TezosAmount)``;
const BalanceAmount = styled(TezosAmount)``;

const WarningIcon = styled(TezosIcon)`
  padding: 0 ${ms(-9)} 0 0;
  position: relative;
  top: 1px;
`;
const BalanceTitle = styled.div`
  color: ${({ theme: { colors } }) => colors.gray5};
  font-size: 14px;
  font-weight: 300;
`;
const ErrorContainer = styled.div`
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme: { colors } }) => colors.error1};
`;

const BottomContainer = styled.div`
  display: flex;
  align-items: center;
  height: 96px;
  width: 100%;
  margin-top: 15px;
`;

const utez = 1000000;

interface OwnProps {
  isReady: boolean;
  addressBalance: number;
}

interface StoreProps {
  isLedger: boolean;
  isLoading: boolean;
  selectedAccountHash: string;
  selectedParentHash: string;
  getIsImplicitAndEmpty: (address: string) => Promise<boolean>;
  fetchFees: (op: OperationKindType) => Promise<AverageFees>;
  getIsReveal: () => Promise<boolean>;
  setIsLoading: (flag: boolean) => void;
  sendTez: (password: string, toAddress: string, amount: string, fee: number) => boolean;
  sendDelegatedFunds: (password: string, toAddress: string, amount: string, fee: number) => void;
  deposit: (fee: number, amount: string, password: string, toAddress: string) => void;
  validateAmount: (amount: string, toAddress: string) => boolean;
}

type Props = OwnProps & StoreProps & WithTranslation;

const initialState = {
  toAddress: '',
  amount: '',
  fee: 2840,
  miniFee: 0,
  isBurn: false,
  isFeeTooltip: false,
  averageFees: {
    low: 1420,
    medium: 2840,
    high: 5680
  },
  total: 1420,
  balance: 0
};

function Send(props: Props) {
  const {
    isReady,
    isLoading,
    isLedger,
    addressBalance,
    selectedAccountHash,
    selectedParentHash,
    fetchFees,
    setIsLoading,
    getIsReveal,
    getIsImplicitAndEmpty,
    sendDelegatedFunds,
    sendTez,
    deposit,
    validateAmount,
    t
  } = props;
  const [state, setState] = useState(() => {
    return {
      ...initialState,
      balance: addressBalance
    };
  });
  const [password, setPassword] = useState('');
  const [open, setOpen] = useState(false);
  const [addressType, setAddressType] = useState<AddressType>(AddressType.None);
  const [isAddressIssue, setIsAddressIssue] = useState(false);
  const {
    toAddress,
    amount,
    fee,
    miniFee,
    isBurn,
    isFeeTooltip,
    averageFees,
    total,
    balance
  } = state;

  async function getFeesAndReveals() {
    const newFees = await fetchFees(OperationKindType.Transaction);
    const isRevealed = await getIsReveal().catch(() => false);
    let miniLowFee = OPERATIONFEE;
    if (!isRevealed) {
      newFees.low += REVEALOPERATIONFEE;
      newFees.medium += REVEALOPERATIONFEE;
      newFees.high += REVEALOPERATIONFEE;
      miniLowFee += REVEALOPERATIONFEE;
    }
    if (newFees.low < miniLowFee) {
      newFees.low = miniLowFee;
    }
    const newBalance = addressBalance - newFees.medium;

    setState(prevState => {
      return {
        ...prevState,
        averageFees: newFees,
        fee: newFees.medium,
        total: newFees.medium,
        isDisplayedFeeTooltip: !isRevealed,
        miniFee: miniLowFee,
        balance: newBalance
      };
    });
  }

  useEffect(() => {
    getFeesAndReveals();
  }, [selectedAccountHash]);

  function onUseMax() {
    const burnFee = isBurn ? 257000 : 0;
    const max = addressBalance - fee - burnFee;
    let newAmount = '0';
    let newTotal = fee;
    let newBalance = addressBalance - total;
    if (max > 0) {
      newAmount = (max / utez).toFixed(6);
      newTotal = addressBalance;
      newBalance = 0;
    }
    setState(prevState => {
      return {
        ...prevState,
        amount: newAmount,
        total: newTotal,
        balance: newBalance
      };
    });
  }

  function onEnterPress(keyVal) {
    if (keyVal === 'Enter') {
      onSend();
    }
  }

  async function handleToAddressChange(newAddress: string) {
    const isDisplayedBurn = await getIsImplicitAndEmpty(newAddress);
    const burnFee = isDisplayedBurn ? 257000 : 0;
    const newAmount = amount || '0';
    const numAmount = parseFloat(newAmount) * utez;
    const newTotal = numAmount + fee + burnFee;
    const newBalance = addressBalance - newTotal;
    setState(prevState => {
      return {
        ...prevState,
        toAddress: newAddress,
        total: newTotal,
        balance: newBalance,
        isBurn: isDisplayedBurn
      };
    });
  }

  function handleAmountChange(value: string = '0') {
    const newAmount = value !== '' ? value : '0';
    const burnFee = isBurn ? 257000 : 0;
    const commaReplacedAmount = newAmount.replace(',', '.');
    const numAmount = parseFloat(commaReplacedAmount) * utez;
    const newTotal = numAmount + fee + burnFee;
    const newBalance = addressBalance - total;
    setState(prevState => {
      return {
        ...prevState,
        total: newTotal,
        balance: newBalance,
        amount: value
      };
    });
  }
  function handleFeeChange(newFee) {
    const burnFee = isBurn ? 257000 : 0;
    const newAmount = amount || '0';
    const numAmount = parseFloat(newAmount) * utez;
    const newTotal = numAmount + newFee + burnFee;
    const newBalance = addressBalance - total;
    setState(prevState => {
      return {
        ...prevState,
        total: newTotal,
        balance: newBalance,
        fee: newFee
      };
    });
  }

  async function onValidateAmount() {
    if (await validateAmount(amount, toAddress)) {
      setOpen(true);
      if (isLedger) {
        onSend();
      }
    }
  }

  async function onSend() {
    setIsLoading(true);
    if (selectedAccountHash.startsWith('KT1') && selectedParentHash !== toAddress) {
      await sendDelegatedFunds(password, toAddress, amount, Math.floor(fee));
    } else if (selectedAccountHash.startsWith('KT1')) {
      await deposit(fee, amount, password, toAddress);
    } else if (addressType === AddressType.Smart) {
      await deposit(fee, amount, password, toAddress);
    } else {
      await sendTez(password, toAddress, amount, Math.floor(fee));
    }

    setOpen(false);
    setIsLoading(false);
  }

  function getBalanceState() {
    const realAmount = !amount ? Number(amount) : 0;
    if (balance <= 0 || balance < realAmount) {
      return {
        isIssue: true,
        warningMessage: t('components.send.warnings.total_exceeds'),
        balanceColor: 'error1'
      };
    }
    return {
      isIssue: false,
      warningMessage: '',
      balanceColor: 'gray8'
    };
  }

  function renderBurnToolTip() {
    return (
      <TooltipContainer>
        <TooltipTitle>{t('components.send.burn_tooltip_title')}</TooltipTitle>
        <TooltipContent>
          <Trans i18nKey="components.send.burn_tooltip_content">
            The recepient address you entered has a zero balance. Sending funds to an empty Manager
            address (tz1,2,3) requires a one-time
            <BoldSpan>0.257</BoldSpan> XTZ burn fee.
          </Trans>
        </TooltipContent>
      </TooltipContainer>
    );
  }

  function renderError(msg: string) {
    return (
      <ErrorContainer>
        <WarningIcon iconName="warning" size={ms(-1)} color="error1" />
        {msg}
      </ErrorContainer>
    );
  }

  function renderFeeToolTip() {
    return (
      <TooltipContainer>
        <TooltipTitle>{t('components.send.fee_tooltip_title')}</TooltipTitle>
        <TooltipContent>
          <Trans i18nKey="components.send.fee_tooltip_content">
            This address is not revealed on the blockchain. We have added
            <BoldSpan>0.001420 XTZ</BoldSpan> for Public Key Reveal to your regular send operation
            fee.
          </Trans>
        </TooltipContent>
      </TooltipContainer>
    );
  }

  const { isIssue, warningMessage, balanceColor } = getBalanceState();
  const error = isIssue ? renderError(warningMessage) : '';
  const isDisabled =
    amount === '0' || !amount || !toAddress || !isReady || isIssue || isLoading || isAddressIssue;

  const buttonTitle =
    addressType === AddressType.Manager ? t('general.verbs.send') : t('general.verbs.deposit');

  return (
    <SendContainer>
      <SendTitle>{t('components.send.send_xtz')}</SendTitle>
      <InputAddress
        label={t('components.send.recipient_address')}
        address={selectedAccountHash}
        operationType="send"
        onChange={handleToAddressChange}
        onIssue={err => setIsAddressIssue(err)}
        onAddressType={type => setAddressType(type)}
      />
      <InputAmount>
        <TezosNumericInput
          decimalSeparator={t('general.decimal_separator')}
          label={t('general.nouns.amount')}
          amount={amount}
          onChange={handleAmountChange}
          errorText={error}
        />
        <UseMax onClick={() => onUseMax}>{t('general.verbs.use_max')}</UseMax>
      </InputAmount>
      <FeesBurnContainer>
        <FeeContainer>
          <Fees
            low={averageFees.low}
            medium={averageFees.medium}
            high={averageFees.high}
            fee={fee}
            miniFee={miniFee}
            onChange={handleFeeChange}
            tooltip={
              isFeeTooltip ? (
                <Tooltip
                  position="bottom"
                  content={renderFeeToolTip()}
                  offset={[70, 0]}
                  arrowPos={{
                    left: '71%'
                  }}
                >
                  <FeeTooltip buttonTheme="plain">
                    <HelpIcon iconName="help" size={ms(1)} color="gray5" />
                  </FeeTooltip>
                </Tooltip>
              ) : null
            }
          />
        </FeeContainer>
        {isBurn && (
          <BurnsContainer>
            <TextField
              disabled={true}
              label={t('components.transaction.burn')}
              defaultValue="0.257000"
            />
            <TezosIconInput color="gray5" iconName="tezos" />
            <Tooltip
              position="bottom"
              content={renderBurnToolTip()}
              offset={[70, 0]}
              arrowPos={{
                left: '71%'
              }}
            >
              <BurnTooltip buttonTheme="plain">
                <HelpIcon iconName="help" size={ms(1)} color="gray5" />
              </BurnTooltip>
            </Tooltip>
          </BurnsContainer>
        )}
      </FeesBurnContainer>

      <BottomContainer>
        <TotalContent>
          <BalanceTitle>{t('general.nouns.total')}</BalanceTitle>
          <TotalAmount
            weight="500"
            color={amount ? 'gray3' : 'gray8'}
            size={ms(0.65)}
            amount={total}
          />
        </TotalContent>
        <BalanceContent>
          <BalanceTitle>{t('general.nouns.remaining_balance')}</BalanceTitle>
          <BalanceAmount weight="500" color={balanceColor} size={ms(0.65)} amount={balance} />
        </BalanceContent>
        <SendButton disabled={isDisabled} onClick={() => onValidateAmount()} buttonTheme="primary">
          {buttonTitle}
        </SendButton>
      </BottomContainer>

      {!isLedger ? (
        <SendConfirmationModal
          onEnterPress={event => onEnterPress(event.key)}
          amount={amount}
          fee={fee}
          source={selectedAccountHash}
          password={password}
          address={toAddress}
          open={open}
          onClose={() => setOpen(false)}
          onPasswordChange={val => setPassword(val)}
          onSend={() => onSend()}
          isLoading={isLoading}
          isBurn={isBurn}
        />
      ) : (
        <SendLedgerConfirmationModal
          amount={amount}
          fee={fee}
          address={toAddress}
          source={selectedAccountHash}
          open={open}
          onClose={() => setOpen(false)}
          isLoading={isLoading}
        />
      )}
    </SendContainer>
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
  getIsImplicitAndEmpty: (address: string) => dispatch(getIsImplicitAndEmptyThunk(address)),
  sendTez: (password: string, toAddress: string, amount: string, fee: number) =>
    dispatch(sendTezThunk(password, toAddress, amount, fee)),
  sendDelegatedFunds: (password: string, toAddress: string, amount: string, fee: number) =>
    dispatch(sendDelegatedFundsThunk(password, toAddress, amount, fee)),
  deposit: (fee: number, amount: string, password: string, toAddress: string) =>
    dispatch(depositThunk(fee, amount, password, toAddress)),
  validateAmount: (amount: string, toAddress: string) =>
    dispatch(validateAmountThunk(amount, toAddress))
});

export default compose(
  withTranslation(),
  connect(mapStateToProps, mapDispatchToProps)
)(Send) as React.ComponentType<OwnProps>;
