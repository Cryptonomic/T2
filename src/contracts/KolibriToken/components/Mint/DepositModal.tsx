import React, { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { OperationKindType } from 'conseiljs';
import IconButton from '@mui/material/IconButton';
import TextField from '../../../../components/TextField';
import TezosNumericInput from '../../../../components/TezosNumericInput';
import LedgerConfirmModal from '../Ledger/LedgerConfirmModal';

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
import { deposit } from '../../thunks';
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

const utez = 1_000_000;
const MinBalance = 3_000_001;

const FEES = {
    low: 18000,
    medium: 21000,
    high: 24000,
};

interface Props {
    open: boolean;
    managerBalance: number;
    ovenAddress: string;
    onClose: () => void;
}

// TODO(keefertaylor): Investigate if we require the ledger variant as well.
// TODO(keefertaylor): Remove redundant information - gas, etc
// TODO(keefertaylor): Include oven as a property.
// TODO(keefertaylor): Display oven address somewhere.
function DepositModal(props: Props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [delegate, setDelegate] = useState('');
    const [passPhrase, setPassPhrase] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [isDelegateIssue, setIsDelegateIssue] = useState(false);

    const [amount, setAmount] = useState('');
    const [numAmount, setNumAmount] = useState(0);

    const [fee, setFee] = useState(FEES.medium);
    const [total, setTotal] = useState(FEES.medium);
    const [balance, setBalance] = useState(props.managerBalance - total);

    const { isLoading, isLedger, selectedParentHash } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
    const { open, managerBalance, ovenAddress, onClose } = props;

    // TODO(keefertaylor): Can we remove isDelegateIssue
    const isDisabled = isLoading || !amount || (!passPhrase && !isLedger) || balance < 0;

    function onUseMax() {
        const max = managerBalance - fee - MinBalance;
        let newAmount = '0';
        let newTotal = fee;
        let newBalance = managerBalance - total;
        if (max > 0) {
            newAmount = (max / utez).toFixed(6);
            newTotal = managerBalance - MinBalance;
            newBalance = MinBalance;
        }

        setAmount(newAmount);
        setNumAmount(max);
        setTotal(newTotal);
        setBalance(newBalance);
    }

    function changeAmount(newAmount = '0') {
        const float = Number.isNaN(parseFloat(newAmount)) ? 0.0 : parseFloat(newAmount);
        const newNumAmount = float * utez;
        const newTotal = newNumAmount + fee;

        const newBalance = managerBalance - newTotal;

        setAmount(newAmount);
        setNumAmount(newNumAmount);
        setTotal(newTotal);
        setBalance(newBalance);
    }

    function changeFee(newFee) {
        const newAmount = amount || '0';
        const newNumAmount = parseFloat(newAmount) * utez;
        const newTotal = newNumAmount + newFee;
        const newBalance = managerBalance - total;

        setFee(newFee);
        setTotal(newTotal);
        setBalance(newBalance);
    }

    async function depositToOven() {
        dispatch(setIsLoadingAction(true));
        if (isLedger) {
            setConfirmOpen(true);
        }

        const deposited = await dispatch(deposit(ovenAddress, numAmount, fee, passPhrase));

        setConfirmOpen(false);
        dispatch(setIsLoadingAction(false));
        if (!!deposited) {
            onClose();
        }
    }

    function onCloseClick() {
        const newFee = FEES.medium;
        const newTotal = newFee;

        setFee(newFee);
        setTotal(newTotal);
        setBalance(managerBalance - newTotal);
        onClose();
    }

    function getBalanceState() {
        if (balance < 0) {
            return {
                isIssue: true,
                warningMessage: t('components.addDelegateModal.warning1'),
                balanceColor: 'error1',
            };
        }

        if (amount) {
            return {
                isIssue: false,
                warningMessage: '',
                balanceColor: 'gray3',
            };
        }
        return {
            isIssue: false,
            warningMessage: '',
            balanceColor: 'gray8',
        };
    }

    const { isIssue, warningMessage, balanceColor } = getBalanceState();
    return (
        <Modal
            // TODO(keefertaylor): Translations
            title={'Deposit to Vault'}
            open={open}
            onClose={onCloseClick}
        >
            <MainContainer>
                <MessageContainer>
                    {/* TODO(keefertaylor): Use Translations */}
                    <BoldSpan>Vault:&nbsp;</BoldSpan>
                    {ovenAddress}
                </MessageContainer>
            </MainContainer>
            <MainContainer>
                <MessageContainer>
                    <InfoIcon color="info" iconName="info" />
                    {/* TODO(keefertaylor): Use Translations */}
                    Depositing XTZ to a vault will mint your account wXTZ. StakerDAO withdrawal fee is 4%.
                </MessageContainer>
            </MainContainer>
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
                        <Fees low={FEES.low} medium={FEES.medium} high={FEES.high} fee={fee} miniFee={FEES.low} onChange={changeFee} />
                    </FeeContainer>
                </AmountFeePassContainer>
                <BalanceContainer>
                    <BalanceArrow />
                    <BalanceContent>
                        <BalanceTitle>{t('general.nouns.total')}</BalanceTitle>
                        <TotalAmount weight="500" color={amount ? 'gray3' : 'gray8'} size={ms(0.65)} amount={total} />
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
                        onChange={(val) => setPassPhrase(val)}
                        containerStyle={{ width: '60%', marginTop: '10px' }}
                    />
                )}
                <DelegateButton buttonTheme="primary" disabled={isDisabled} onClick={() => depositToOven()}>
                    {/* TODO(keefertaylor): Translations */}
                    Deposit
                </DelegateButton>
            </PasswordButtonContainer>
            {isLoading && <Loader />}
            {isLedger && open && (
                <LedgerConfirmModal
                    // TODO(keefertaylor): translations
                    message="Confirm the deposit operation"
                    vaultAddress={ovenAddress}
                    source={selectedParentHash}
                    isLoading={isLoading}
                    open={confirmOpen}
                    onClose={() => setConfirmOpen(false)}
                    fee={fee}
                    amount={numAmount}
                />
            )}
        </Modal>
    );
}

export default DepositModal;
