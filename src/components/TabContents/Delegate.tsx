import React, { useState, useEffect } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation, WithTranslation, Trans } from 'react-i18next';
import { OperationKindType } from 'conseiljs';

import InputAddress from '../InputAddress';
import Fees from '../Fees';
import PasswordInput from '../PasswordInput';
import Tooltip from '../Tooltip';
import TezosIcon from '../TezosIcon';
import DelegateLedgerConfirmationModal from '../ConfirmModals/DelegateLedgerConfirmationModal';
import { ms } from '../../styles/helpers';

import { getIsRevealThunk, fetchFeesThunk } from '../../reduxContent/app/thunks';
import { setIsLoadingAction } from '../../reduxContent/app/actions';
import { delegateThunk } from '../../reduxContent/delegate/thunks';

import { OPERATIONFEE, REVEALOPERATIONFEE } from '../../constants/FeeValue';
import { RootState } from '../../types/store';
import { AverageFees } from '../../types/general';

import {
  Container,
  AmountContainer,
  FeeContainer,
  PasswordButtonContainer,
  InvokeButton,
  WarningContainer,
  InfoText,
  TooltipContainer,
  TooltipTitle,
  TooltipContent,
  BoldSpan,
  FeeTooltip,
  HelpIcon
} from './style';

interface OwnProps {
  isReady: boolean;
}

interface StoreProps {
  isLedger: boolean;
  isLoading: boolean;
  selectedAccountHash: string;
  fetchFees: (op: OperationKindType) => Promise<AverageFees>;
  getIsReveal: () => Promise<boolean>;
  delegate: (delegateAddress: string, fee: number, password: string) => Promise<boolean>;
  setIsLoading: (flag: boolean) => void;
}

type Props = OwnProps & StoreProps & WithTranslation;

function Delegate(props: Props) {
  const [miniFee, setMiniFee] = useState(0);
  const [averageFees, setAverageFees] = useState({
    low: 1420,
    medium: 2840,
    high: 5680
  });
  const [fee, setFee] = useState(averageFees.low);
  const [newAddress, setAddress] = useState('');
  const [passPhrase, setPassPhrase] = useState('');
  const [isAddressIssue, setIsAddressIssue] = useState(false);
  const [isDisplayedFeeTooltip, setIsDisplayedFeeTooltip] = useState(false);
  const [open, setOpen] = useState(false);
  const {
    isReady,
    isLoading,
    isLedger,
    selectedAccountHash,
    fetchFees,
    delegate,
    setIsLoading,
    getIsReveal,
    t
  } = props;

  const isDisabled =
    !isReady || isLoading || isAddressIssue || !newAddress || (!passPhrase && !isLedger);

  async function getFeesAndReveals() {
    const newFees = await fetchFees(OperationKindType.Delegation);
    const isRevealed = await getIsReveal();
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
    setAverageFees({ ...newFees });
    setFee(newFees.low);
    setMiniFee(miniLowFee);
    setIsDisplayedFeeTooltip(!isRevealed);
  }

  useEffect(() => {
    getFeesAndReveals();
  }, [selectedAccountHash]);

  async function onDelegate() {
    setIsLoading(true);

    if (isLedger) {
      setOpen(true);
    }

    await delegate(newAddress, fee, passPhrase);
    setOpen(false);
    setIsLoading(false);
  }

  function onEnterPress(keyVal) {
    if (keyVal === 'Enter' && !isDisabled) {
      onDelegate();
    }
  }

  const renderFeeToolTip = () => {
    return (
      <TooltipContainer>
        <TooltipTitle>{t('components.send.fee_tooltip_title')}</TooltipTitle>
        <TooltipContent>
          <Trans i18nKey="components.send.fee_tooltip_content">
            This address is not revealed on the blockchain. We have added
            <BoldSpan>0.001300 XTZ</BoldSpan> for Public Key Reveal to your regular send operation
            fee.
          </Trans>
        </TooltipContent>
      </TooltipContainer>
    );
  };

  return (
    <Container onKeyDown={event => onEnterPress(event.key)}>
      <AmountContainer>
        <InputAddress
          label={t('components.delegateConfirmationModal.new_address_label')}
          operationType="delegate"
          tooltip={false}
          onChange={val => setAddress(val)}
          onIssue={val => setIsAddressIssue(val)}
        />
      </AmountContainer>
      <FeeContainer>
        <Fees
          low={averageFees.low}
          medium={averageFees.medium}
          high={averageFees.high}
          fee={fee}
          miniFee={miniFee}
          onChange={val => setFee(val)}
          tooltip={
            isDisplayedFeeTooltip ? (
              <Tooltip position="bottom" content={renderFeeToolTip}>
                <FeeTooltip buttonTheme="plain">
                  <HelpIcon iconName="help" size={ms(1)} color="gray5" />
                </FeeTooltip>
              </Tooltip>
            ) : null
          }
        />
      </FeeContainer>

      <WarningContainer>
        <TezosIcon iconName="info" size={ms(5)} color="info" />
        <InfoText>{t('components.delegateConfirmationModal.delegate_warning')}</InfoText>
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
        <InvokeButton buttonTheme="primary" disabled={isDisabled} onClick={() => onDelegate()}>
          {t('components.delegate.change_delegate')}
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

const mapStateToProps = (state: RootState) => ({
  isLoading: state.app.isLoading,
  isLedger: state.app.isLedger,
  selectedAccountHash: state.app.selectedAccountHash
});

const mapDispatchToProps = dispatch => ({
  setIsLoading: (flag: boolean) => dispatch(setIsLoadingAction(flag)),
  fetchFees: (op: OperationKindType) => dispatch(fetchFeesThunk(op)),
  getIsReveal: () => dispatch(getIsRevealThunk()),
  delegate: (delegateAddress: string, fee: number, password: string) =>
    dispatch(delegateThunk(delegateAddress, fee, password))
});

export default compose(
  withTranslation(),
  connect(mapStateToProps, mapDispatchToProps)
)(Delegate) as React.ComponentType<OwnProps>;
