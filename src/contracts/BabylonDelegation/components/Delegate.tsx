import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import { OperationKindType } from 'conseiljs';

import InputAddress from '../../../components/InputAddress';
import Fees from '../../../components/Fees';
import PasswordInput from '../../../components/PasswordInput';
import Tooltip from '../../../components/Tooltip';
import TezosIcon from '../../../components/TezosIcon';
import DelegateLedgerConfirmationModal from '../../../components/ConfirmModals/DelegateLedgerConfirmationModal';
import { ms } from '../../../styles/helpers';

import { useFetchFees } from '../../../reduxContent/app/thunks';
import { setIsLoadingAction } from '../../../reduxContent/app/actions';
import { delegateThunk } from '../../duck/thunks';

import { RootState, AppState } from '../../../types/store';
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
    FeeTooltipBtn,
} from './style';

interface Props {
    isReady: boolean;
}

function Delegate(props: Props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [fee, setFee] = useState(5000);
    const [newAddress, setAddress] = useState('');
    const [passPhrase, setPassPhrase] = useState('');
    const [isAddressIssue, setIsAddressIssue] = useState(false);
    const [open, setOpen] = useState(false);
    const { newFees, miniFee, isRevealed } = useFetchFees(OperationKindType.Transaction, true, true);

    const { isLoading, isLedger, selectedAccountHash } = useSelector<RootState, AppState>((state: RootState) => state.app, shallowEqual);

    const { isReady } = props;

    const isDisabled = !isReady || isLoading || isAddressIssue || !newAddress || (!passPhrase && !isLedger);

    async function onDelegate() {
        dispatch(setIsLoadingAction(true));

        if (isLedger) {
            setOpen(true);
        }

        await dispatch(delegateThunk(newAddress, fee, passPhrase));
        setOpen(false);
        dispatch(setIsLoadingAction(false));
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
                        <BoldSpan>0.001300 XTZ</BoldSpan> for Public Key Reveal to your regular send operation fee.
                    </Trans>
                </TooltipContent>
            </TooltipContainer>
        );
    };

    return (
        <Container onKeyDown={(event) => onEnterPress(event.key)}>
            <AmountContainer>
                <InputAddress
                    label={t('components.delegateConfirmationModal.new_address_label')}
                    operationType="delegate"
                    tooltip={false}
                    onChange={(val) => setAddress(val)}
                    onIssue={(val) => setIsAddressIssue(val)}
                />
            </AmountContainer>
            <FeeContainer>
                <Fees
                    low={newFees.low}
                    medium={newFees.medium}
                    high={newFees.high}
                    fee={fee}
                    miniFee={miniFee}
                    onChange={(val) => setFee(val)}
                    tooltip={
                        !isRevealed && (
                            <Tooltip position="bottom" content={renderFeeToolTip}>
                                <FeeTooltipBtn size="small">
                                    <TezosIcon iconName="help" size={ms(1)} color="gray5" />
                                </FeeTooltipBtn>
                            </Tooltip>
                        )
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
                        onChange={(val) => setPassPhrase(val)}
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

export default Delegate;
