import React, { useState, useEffect } from 'react';
import { withTranslation, WithTranslation, Trans } from 'react-i18next';
import { compose } from 'redux';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { TezosParameterFormat, OperationKindType } from 'conseiljs';
import IconButton from '@material-ui/core/IconButton';
import TextField from '../TextField';
import TezosNumericInput from '../TezosNumericInput';

import Modal from '../CustomModal';
import Tooltip from '../Tooltip/';
import { ms } from '../../styles/helpers';
import TezosIcon from '../TezosIcon';
import Button from '../Button';
import Loader from '../Loader';
import Fees from '../Fees/';
import PasswordInput from '../PasswordInput';
import InputAddress from '../InputAddress';
import TezosAmount from '../TezosAmount';
import AddDelegateLedgerModal from './AddDelegateLedgerModal';

import { originateContractThunk } from '../../reduxContent/originate/thunks';
import { getIsRevealThunk, fetchFeesThunk } from '../../reduxContent/app/thunks';
import { setIsLoadingAction } from '../../reduxContent/app/actions';

import { OPERATIONFEE, REVEALOPERATIONFEE } from '../../constants/FeeValue';
import { RootState } from '../../types/store';
import { AverageFees } from '../../types/general';

const InputAddressContainer = styled.div`
  padding: 0 76px;
`;

const AmountFeePassContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 43%;
  justify-content: center;
`;

const AmountSendContainer = styled.div`
  width: 100%;
  position: relative;
`;

const FeeContainer = styled.div`
  width: 100%;
  display: flex;
  height: 64px;
`;

const PasswordButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 42px;
  padding: 0 76px 15px 76px;
  background-color: ${({ theme: { colors } }) => colors.gray1};
  height: 100px;
`;

const DelegateButton = styled(Button)`
  width: 194px;
  height: 50px;
  margin-bottom: 10px;
  margin-left: auto;
`;

const MainContainer = styled.div`
  display: flex;
  padding: 20px 76px 0 76px;
`;
const BalanceContainer = styled.div`
  padding: 0 0px 0 20px;
  flex: 1;
  position: relative;
  margin: 0 0 0px 35px;
`;

const BalanceArrow = styled.div`
  top: 50%;
  left: 4px;
  margin-top: -17px;
  border-top: 17px solid transparent;
  border-bottom: 17px solid transparent;
  border-right: 20px solid ${({ theme: { colors } }) => colors.gray1};
  width: 0;
  height: 0;
  position: absolute;
`;

const BalanceContent = styled.div`
  padding: ${ms(1)} ${ms(1)} ${ms(1)} ${ms(4)};
  color: #123262;
  text-align: left;
  height: 100%;
  background-color: ${({ theme: { colors } }) => colors.gray1};
`;

const GasInputContainer = styled.div`
  width: 100%;
  position: relative;
`;

const TezosIconInput = styled(TezosIcon)`
  position: absolute;
  left: 70px;
  top: 25px;
  display: block;
`;

const UseMax = styled.div`
  position: absolute;
  right: 23px;
  top: 24px;
  font-size: 12px;
  font-weight: 500;
  display: block;
  color: ${({ theme: { colors } }) => colors.accent};
  cursor: pointer;
`;
const TotalAmount = styled(TezosAmount)`
  margin-bottom: 22px;
`;

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

const BurnTooltip = styled(IconButton)`
  &&& {
    position: absolute;
    right: 110px;
    top: 20px;
  }
`;

const TooltipContainer = styled.div`
  padding: 10px;
  color: #000;
  font-size: 14px;
  max-width: 312px;
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

const utez = 1000000;

interface OwnProps {
  open: boolean;
  onClose: () => void;
  managerBalance: number;
}

interface StoreProps {
  isLedger: boolean;
  isLoading: boolean;
  selectedParentHash: string;
  fetchFees: (op: OperationKindType) => Promise<AverageFees>;
  getIsReveal: (isManger: boolean) => Promise<boolean>;
  originateContract: (
    delegate: string,
    amount: string,
    fee: number,
    passPhrase: string,
    publicKeyHash: string,
    storageLimit?: number,
    gasLimit?: number,
    code?: string,
    storage?: string,
    codeFormat?: TezosParameterFormat,
    isSmartContract?: boolean
  ) => Promise<boolean>;
  setIsLoading: (flag: boolean) => void;
}

type Props = OwnProps & StoreProps & WithTranslation;

const defaultState = {
  amount: '',
  fee: 2840,
  miniFee: 0,
  averageFees: {
    low: 1420,
    medium: 2840,
    high: 5680
  },
  gas: 257000,
  total: 0,
  isDisplayedFeeTooltip: false,
  balance: 0
};

function AddDelegateModal(props: Props) {
  const {
    open,
    isLoading,
    isLedger,
    managerBalance,
    selectedParentHash,
    fetchFees,
    originateContract,
    setIsLoading,
    getIsReveal,
    onClose,
    t
  } = props;
  const [state, setState] = useState(defaultState);
  const [delegate, setDelegate] = useState('');
  const [passPhrase, setPassPhrase] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDelegateIssue, setIsDelegateIssue] = useState(false);
  const { amount, fee, miniFee, averageFees, gas, isDisplayedFeeTooltip, total, balance } = state;

  const isDisabled =
    isLoading ||
    !delegate ||
    !amount ||
    (!passPhrase && !isLedger) ||
    balance < 0 ||
    isDelegateIssue;

  function updateState(updatedValues) {
    setState(prevState => {
      return { ...prevState, ...updatedValues };
    });
  }

  async function getFeesAndReveals() {
    const newFees = await fetchFees(OperationKindType.Origination);
    const isRevealed = await getIsReveal(true);
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
    const newFee = newFees.medium;
    const newTotal = newFee + gas;
    updateState({
      averageFees: newFees,
      fee: newFee,
      total: newTotal,
      balance: managerBalance - newTotal,
      isDisplayedFeeTooltip: !isRevealed,
      miniFee: miniLowFee
    });
  }

  useEffect(() => {
    getFeesAndReveals();
  }, [selectedParentHash]);

  function onUseMax() {
    const max = managerBalance - fee - gas;
    let newAmount = '0';
    let newTotal = fee + gas;
    let newBalance = managerBalance - total;
    if (max > 0) {
      newAmount = (max / utez).toFixed(6);
      newTotal = managerBalance;
      newBalance = 0;
    }
    updateState({ amount: newAmount, total: newTotal, balance: newBalance });
  }

  function changeAmount(newAmount = '0') {
    const commaReplacedAmount = newAmount.replace(',', '.');
    const numAmount = parseFloat(commaReplacedAmount) * utez;
    const newTotal = numAmount + fee + gas;
    const newBalance = managerBalance - total;
    updateState({ amount: newAmount, total: newTotal, balance: newBalance });
  }

  function changeFee(newFee) {
    const newAmount = amount || '0';
    const numAmount = parseFloat(newAmount) * utez;
    const newTotal = numAmount + newFee + gas;
    const newBalance = managerBalance - total;
    updateState({ fee: newFee, total: newTotal, balance: newBalance });
  }

  async function createAccount() {
    setIsLoading(true);
    if (isLedger) {
      setConfirmOpen(true);
    }

    const isCreated = await originateContract(
      delegate,
      amount,
      Math.floor(fee),
      passPhrase,
      selectedParentHash
    ).catch(err => {
      console.error(err);
      return false;
    });
    setConfirmOpen(false);
    setIsLoading(false);
    if (isCreated) {
      onClose();
    }
  }

  function renderGasToolTip() {
    return (
      <TooltipContainer>
        {t('components.addDelegateModal.gas_tool_tip', { gas: gas / utez })}
      </TooltipContainer>
    );
  }

  function onCloseClick() {
    const newFee = averageFees.medium;
    const newTotal = newFee + gas;
    updateState({ fee: newFee, total: newTotal, balance: managerBalance - total });
    onClose();
  }

  function getBalanceState() {
    if (balance < 0) {
      return {
        isIssue: true,
        warningMessage: t('components.addDelegateModal.warning1'),
        balanceColor: 'error1'
      };
    }

    if (amount) {
      return {
        isIssue: false,
        warningMessage: '',
        balanceColor: 'gray3'
      };
    }
    return {
      isIssue: false,
      warningMessage: '',
      balanceColor: 'gray8'
    };
  }

  function onEnterPress(keyVal) {
    if (keyVal === 'Enter' && !isDisabled) {
      createAccount();
    }
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
  return (
    <Modal
      title={t('components.addDelegateModal.add_delegate_title')}
      open={open}
      onClose={onCloseClick}
    >
      <InputAddressContainer>
        <InputAddress
          label={t('general.nouns.delegate_address')}
          operationType="delegate"
          tooltip={true}
          onChange={val => setDelegate(val)}
          onIssue={flag => setIsDelegateIssue(flag)}
        />
      </InputAddressContainer>
      <MainContainer>
        <AmountFeePassContainer>
          <AmountSendContainer>
            <TezosNumericInput
              decimalSeparator={t('general.decimal_separator')}
              label={t('general.nouns.amount')}
              amount={amount}
              onChange={changeAmount}
            />
            <UseMax onClick={onUseMax}>{t('general.verbs.use_max')}</UseMax>
          </AmountSendContainer>
          <FeeContainer>
            <Fees
              low={averageFees.low}
              medium={averageFees.medium}
              high={averageFees.high}
              fee={fee}
              miniFee={miniFee}
              onChange={changeFee}
              tooltip={
                isDisplayedFeeTooltip ? (
                  <Tooltip position="bottom" content={renderFeeToolTip()}>
                    <IconButton size="small">
                      <TezosIcon iconName="help" size={ms(1)} color="gray5" />
                    </IconButton>
                  </Tooltip>
                ) : null
              }
            />
          </FeeContainer>
          <GasInputContainer>
            <TextField disabled={true} label={t('general.nouns.gas')} defaultValue="0.257000" />
            <TezosIconInput color="gray5" iconName="tezos" />
            <Tooltip position="bottom" content={renderGasToolTip()}>
              <BurnTooltip size="small">
                <TezosIcon iconName="help" size={ms(1)} color="gray5" />
              </BurnTooltip>
            </Tooltip>
          </GasInputContainer>
        </AmountFeePassContainer>
        <BalanceContainer>
          <BalanceArrow />
          <BalanceContent>
            <BalanceTitle>{t('general.nouns.total')}</BalanceTitle>
            <TotalAmount
              weight="500"
              color={amount ? 'gray3' : 'gray8'}
              size={ms(0.65)}
              amount={total}
            />
            <BalanceTitle>{t('general.nouns.remaining_balance')}</BalanceTitle>
            <BalanceAmount weight="500" color={balanceColor} size={ms(-0.75)} amount={balance} />
            {isIssue && (
              <ErrorContainer>
                <WarningIcon iconName="warning" size={ms(-1)} color="error1" />
                {warningMessage}
              </ErrorContainer>
            )}
          </BalanceContent>
        </BalanceContainer>
      </MainContainer>

      <PasswordButtonContainer>
        {!isLedger && (
          <PasswordInput
            label={t('general.nouns.wallet_password')}
            password={passPhrase}
            onChange={val => setPassPhrase(val)}
            containerStyle={{ width: '60%', marginTop: '10px' }}
          />
        )}
        <DelegateButton buttonTheme="primary" disabled={isDisabled} onClick={() => createAccount()}>
          {t('general.verbs.delegate')}
        </DelegateButton>
      </PasswordButtonContainer>
      {isLoading && <Loader />}
      {isLedger && open && (
        <AddDelegateLedgerModal
          amount={amount}
          fee={fee}
          address={delegate}
          source={selectedParentHash}
          manager={selectedParentHash}
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          isLoading={isLoading}
        />
      )}
    </Modal>
  );
}

const mapStateToProps = (state: RootState) => ({
  isLoading: state.app.isLoading,
  isLedger: state.app.isLedger,
  selectedParentHash: state.app.selectedParentHash
});

const mapDispatchToProps = dispatch => ({
  setIsLoading: (flag: boolean) => dispatch(setIsLoadingAction(flag)),
  fetchFees: (op: OperationKindType) => dispatch(fetchFeesThunk(op)),
  getIsReveal: (isManger: boolean = false) => dispatch(getIsRevealThunk(isManger)),
  originateContract: (
    delegate: string,
    amount: string,
    fee: number,
    passPhrase: string,
    publicKeyHash: string,
    storageLimit: number = 0,
    gasLimit: number = 0,
    code: string,
    storage: string,
    codeFormat: TezosParameterFormat,
    isSmartContract: boolean = false
  ) =>
    dispatch(
      originateContractThunk(
        delegate,
        amount,
        fee,
        passPhrase,
        publicKeyHash,
        storageLimit,
        gasLimit,
        code,
        storage,
        codeFormat,
        isSmartContract
      )
    )
});

export default compose(
  withTranslation(),
  connect(mapStateToProps, mapDispatchToProps)
)(AddDelegateModal) as React.ComponentType<OwnProps>;
