import React, { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { OperationKindType } from 'conseiljs';
import IconButton from '@material-ui/core/IconButton';
import TextField from '../../../../components/TextField';
import TezosNumericInput from '../../../../components/TezosNumericInput';

import Modal from '../../../../components/CustomModal';
import Tooltip from '../../../../components/Tooltip/';
import { ms } from '../../../../styles/helpers';
import TezosIcon from '../../../../components/TezosIcon';
import Button from '../../../../components/Button';
import Loader from '../../../../components/Loader';
import Fees from '../../../../components/Fees/';
import PasswordInput from '../../../../components/PasswordInput';
import InputAddress from '../../../../components/InputAddress';
import TezosAmount from '../../../../components/TezosAmount';
import AddDelegateLedgerModal from '../../../../components/ConfirmModals/AddDelegateLedgerModal';

import { originateContractThunk } from '../../../../reduxContent/originate/thunks';
import { useFetchFees } from '../../../../reduxContent/app/thunks';
import { setIsLoadingAction } from '../../../../reduxContent/app/actions';
import { withdraw } from '../../thunks';
import AmountView from '../../../../components/AmountView';
import { getTokenSelector } from '../../../duck/selectors';

import { RootState } from '../../../../types/store';

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

const MessageContainer = styled.div`
    display: flex;
    justify-content: left;
    align-items: flex-start;
    height: 30px;
    width: 100%;
    color: #4e71ab;
    font-weight: 300;
`;

const InfoIcon = styled(TezosIcon)`
    font-size: ${ms(2)};
    padding: 1px 7px 0px 0px;
`;

const utez = 1000000;

const FEES = {
    low: 0,
    medium: 60000,
    high: 1000000,
};

interface Props {
    open: boolean;
    managerBalance: number;
    wrappedTezBalance: number;
    vaultBalance: number;
    ovenAddress: string;
    onClose: () => void;
}

const defaultState = {
    wxtzToWithdraw: '',
    wxtzToWithdrawNumber: 0,
    wxtzRemaining: 0,
    fee: FEES.medium,
    total: 0,
    balance: 0,
};

// TODO(keefertaylor): Investigate if we require the ledger variant as well.
// TODO(keefertaylor): Remove redundant information - gas, etc
// TODO(keefertaylor): Include oven as a property.
// TODO(keefertaylor): Display oven address somewhere.
function DepositModal(props: Props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [state, setState] = useState(defaultState);
    // TODO(keefertaylor): Remove delegate code.
    const [delegate, setDelegate] = useState('');
    const [passPhrase, setPassPhrase] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [isDelegateIssue, setIsDelegateIssue] = useState(false);
    const { wxtzToWithdraw, wxtzToWithdrawNumber, wxtzRemaining, fee, total, balance } = state;
    const selectedToken = useSelector(getTokenSelector);

    const { isLoading, isLedger, selectedParentHash } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
    const { open, managerBalance, ovenAddress, wrappedTezBalance, vaultBalance, onClose } = props;

    const {
        isWxtzBalanceIssue,
        wxtzWarningMessage,
        wxtzBalanceColor,
        isXtzBalanceIssue,
        xtzWarningMessage,
        xtzBalanceColor,
        isWxtzAmountIssue,
        wxtzAmountWarningMessage,
        wxtzAmountColor,
    } = getBalanceState();
    const isDisabled =
        isLoading || !wxtzToWithdraw || (!passPhrase && !isLedger) || isXtzBalanceIssue || isWxtzBalanceIssue || isWxtzAmountIssue || isDelegateIssue;

    function updateState(updatedValues) {
        setState((prevState) => {
            return { ...prevState, ...updatedValues };
        });
    }

    function onUseMax() {
        const max = wrappedTezBalance;
        const newWxtzToWithdraw = (max / utez).toFixed(6);
        updateState({ wxtzToWithdraw: newWxtzToWithdraw, wxtzToWithdrawNumber: max, wxtzRemaining: 0 });
    }

    function changeWxtzToWithdraw(newWxtzToWithdraw = '0') {
        const commaReplacedAmount = newWxtzToWithdraw.replace(',', '.');
        const numWxtzToWithdraw = parseFloat(commaReplacedAmount) * utez;
        console.log('STAKERDAO: FOR THE LOVE OF GOD, my balance is ' + props.wrappedTezBalance);

        const numWxtzRemaining = props.wrappedTezBalance - numWxtzToWithdraw;
        updateState({ wxtzToWithdraw: newWxtzToWithdraw, wxtzToWithdrawNumber: numWxtzToWithdraw, wxtzRemaining: numWxtzRemaining });
    }

    function changeFee(newFee) {
        const newBalance = managerBalance - newFee;
        updateState({ fee: newFee, total: newFee, balance: newBalance });
    }

    async function withdrawFromOven() {
        dispatch(setIsLoadingAction(true));
        if (isLedger) {
            setConfirmOpen(true);
        }
        const isWithdrawn = await dispatch(withdraw(ovenAddress, wxtzToWithdrawNumber, fee, passPhrase));
        setConfirmOpen(false);
        dispatch(setIsLoadingAction(false));
        if (!!isWithdrawn) {
            onClose();
        }
    }

    function onCloseClick() {
        const newFee = FEES.medium;
        const newTotal = newFee;
        updateState({ fee: newFee, total: newTotal, balance: managerBalance - newTotal });
        onClose();
    }

    function getBalanceState() {
        // Ensure there is adequate WXTZ balance
        const newIsWxtzBalanceIssue = wxtzRemaining < 0;
        // TODO(keefertaylor): Translations
        const newWxtzWarningMessage = isWxtzBalanceIssue ? 'Insuffient WXTZ' : '';
        const newWxtzBalanceColor = isWxtzBalanceIssue ? 'error1' : 'gray8';

        // Ensure the user is not repaying more XTZ than is in the vault.
        const newIsWxtzAmountIssue = wxtzToWithdrawNumber > vaultBalance;
        // TODO(keefertaylor): Translations
        const newWxtzAmountWarningMessage = isWxtzAmountIssue ? 'Withdrawing more than available balance.' : '';
        const newWxtzAmountColor = isWxtzAmountIssue ? 'error1' : 'gray8';

        // Ensure there is adequate XTZ balance
        const newIsXtzBalanceIssue = balance < 0;
        const newXtzWarningMessage = isXtzBalanceIssue ? t('components.addDelegateModal.warning1') : '';
        const newXtzBalanceColor = isXtzBalanceIssue ? 'error1' : 'gray8';

        return {
            isWxtzBalanceIssue: newIsWxtzBalanceIssue,
            wxtzWarningMessage: newWxtzWarningMessage,
            wxtzBalanceColor: newWxtzBalanceColor,

            isWxtzAmountIssue: newIsWxtzAmountIssue,
            wxtzAmountWarningMessage: newWxtzAmountWarningMessage,
            wxtzAmountColor: newWxtzAmountColor,

            isXtzBalanceIssue: newIsXtzBalanceIssue,
            xtzWarningMessage: newXtzWarningMessage,
            xtzBalanceColor: newXtzBalanceColor,
        };
    }

    return (
        <Modal
            // TODO(keefertaylor): Translations
            title={'Withdraw from Oven'}
            open={open}
            onClose={onCloseClick}
        >
            <MainContainer>
                <MessageContainer>
                    {/* TODO(keefertaylor): Use Translations */}
                    <BoldSpan>Oven:</BoldSpan>
                    {ovenAddress}
                </MessageContainer>
            </MainContainer>
            <MainContainer>
                <MessageContainer>
                    {/* TODO(keefertaylor): Use Translations */}
                    <BoldSpan>Borrowed WXTZ: </BoldSpan>
                    <AmountView
                        color="black"
                        size={ms(0.5)}
                        amount={vaultBalance}
                        weight="light"
                        symbol={'WXTZ'}
                        showTooltip={true}
                        scale={6}
                        precision={6}
                        round={6}
                    />
                </MessageContainer>
            </MainContainer>
            <MainContainer>
                <MessageContainer>
                    <InfoIcon color="info" iconName="info" />
                    {/* TODO(keefertaylor): Use Translations */}
                    Withdrawing from an Oven will burn your account's WXTZ and return your XTZ
                </MessageContainer>
            </MainContainer>
            <MainContainer>
                <AmountFeePassContainer>
                    <AmountSendContainer>
                        {/* TODO(keefertaylor): Use another type that doesn't have XTZ and label appropriately */}
                        <TezosNumericInput
                            decimalSeparator={t('general.decimal_separator')}
                            label={t('general.nouns.amount')}
                            amount={wxtzToWithdraw}
                            onChange={changeWxtzToWithdraw}
                        />
                        <UseMax onClick={onUseMax}>{t('general.verbs.use_max')}</UseMax>
                    </AmountSendContainer>
                </AmountFeePassContainer>
                <BalanceContainer>
                    <BalanceArrow />
                    <BalanceContent>
                        <BalanceTitle>
                            {/* TODO(keefertaylor): Translations */}
                            WXTZ
                        </BalanceTitle>
                        {/* // TODO(keefertaylor): Change labels */}
                        <TotalAmount weight="500" color={wxtzAmountColor} size={ms(0.65)} amount={wxtzToWithdrawNumber} />
                        <BalanceTitle>{t('general.nouns.remaining_balance')}</BalanceTitle>
                        {isWxtzAmountIssue && (
                            <ErrorContainer>
                                <WarningIcon iconName="warning" size={ms(-1)} color="error1" />
                                {wxtzAmountWarningMessage}
                            </ErrorContainer>
                        )}
                        <BalanceAmount weight="500" color={wxtzBalanceColor} size={ms(-0.75)} amount={wxtzRemaining} />
                        {isWxtzBalanceIssue && (
                            <ErrorContainer>
                                <WarningIcon iconName="warning" size={ms(-1)} color="error1" />
                                {wxtzWarningMessage}
                            </ErrorContainer>
                        )}
                    </BalanceContent>
                </BalanceContainer>
            </MainContainer>
            <MainContainer>
                <AmountFeePassContainer>
                    <FeeContainer>
                        <Fees low={FEES.low} medium={FEES.medium} high={FEES.high} fee={fee} miniFee={FEES.low} onChange={changeFee} />
                    </FeeContainer>
                </AmountFeePassContainer>
                <BalanceContainer>
                    <BalanceArrow />
                    <BalanceContent>
                        <BalanceTitle>
                            {/* TODO(keefertaylor): Translations */}
                            Fees
                        </BalanceTitle>
                        <TotalAmount weight="500" color={total ? 'gray3' : 'gray8'} size={ms(0.65)} amount={total} />
                        <BalanceTitle>{t('general.nouns.remaining_balance')}</BalanceTitle>
                        <BalanceAmount weight="500" color={xtzBalanceColor} size={ms(-0.75)} amount={balance} />
                        {isXtzBalanceIssue && (
                            <ErrorContainer>
                                <WarningIcon iconName="warning" size={ms(-1)} color="error1" />
                                {xtzWarningMessage}
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
                        onChange={(val) => setPassPhrase(val)}
                        containerStyle={{ width: '60%', marginTop: '10px' }}
                    />
                )}
                <DelegateButton buttonTheme="primary" disabled={isDisabled} onClick={() => withdrawFromOven()}>
                    {/* TODO(keefertaylor): Translations */}
                    Withdraw
                </DelegateButton>
            </PasswordButtonContainer>
            {isLoading && <Loader />}
            {/* TODO(keefertaylor): Investigate ledger modal. */}
            {/* {isLedger && open && (
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
      )} */}
        </Modal>
    );
}

export default DepositModal;
