import React, { Fragment } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';
import Modal from '../CustomModal';
import Button from '../Button';
import TezosIcon from '../TezosIcon';
import { ms } from '../../styles/helpers';
import TezosAddress from '../TezosAddress';
import Fees from '../Fees';
import Loader from '../Loader';
import PasswordInput from '../PasswordInput';
import InputAddress from '../InputAddress';
import Tooltip from '../Tooltip';

const ModalContainer = styled.div<{ isAddress: boolean }>`
    padding: ${({ isAddress }) => (isAddress ? '43px 76px 0 76px' : '10px 76px 0 76px')};
`;
const DelegateTitle = styled.div`
    color: ${({ theme: { colors } }) => colors.gray5};
    font-size: 16px;
    letter-spacing: 0.7px;
`;
const AddressContainer = styled.div`
    background-color: ${({ theme: { colors } }) => colors.light};
    height: 53px;
    width: 100%;
    display: flex;
    align-items: center;
    padding-left: 21px;
    margin-top: 10px;
`;

const BottomContainer = styled.div`
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
    padding: 0;
`;

const WarningContainer = styled.div`
    height: 91px;
    width: 100%;
    border: solid 1px rgba(148, 169, 209, 0.49);
    border-radius: 3px;
    background-color: ${({ theme: { colors } }) => colors.light};
    display: flex;
    align-items: center;
    padding: 0 19px;
    margin-top: 36px;
`;
const InfoText = styled.div`
    color: ${({ theme: { colors } }) => colors.primary};
    font-size: 16px;
    letter-spacing: 0.7px;
    margin-left: 11px;
    line-height: 21px;
`;

const FeesContainer = styled.div`
    margin-top: 19px;
`;

const InputAddressContainer = styled.div`
    margin-top: 19px;
`;

const FeeTooltip = styled(Button)`
    position: relative;
    top: 3px;
`;

const HelpIcon = styled(TezosIcon)`
    padding: 0 0 0 ${ms(-4)};
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

interface Props {
    onEnterPress: () => any;
    open: boolean;
    address: string | null;
    newAddress?: string;
    password: string;
    fee: number;
    miniFee: number;
    averageFees: any;
    handleFeeChange: () => any;
    handlePasswordChange: () => any;
    onAddressChange: () => any;
    onDelegate: () => any;
    onCloseClick: () => any;
    isLoading?: boolean;
    isDelegateIssue: boolean;
    onDelegateIssue: () => any;
    isLedger: boolean;
    isDisplayedFeeTooltip: boolean;
}

const DelegateConfirmationModal = (props: Props) => {
    const {
        onEnterPress,
        open,
        address,
        newAddress,
        password,
        fee,
        miniFee,
        averageFees,
        handleFeeChange,
        handlePasswordChange,
        onAddressChange,
        onDelegate,
        onCloseClick,
        isLoading,
        isDelegateIssue,
        onDelegateIssue,
        isLedger,
        isDisplayedFeeTooltip,
    } = props;
    const { t } = useTranslation();
    const isDisabled = isLoading || !newAddress || (!password && !isLedger) || isDelegateIssue;

    const renderFeeToolTip: any = () => {
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
        <Modal
            title={t('components.delegate.change_delegate')}
            open={open}
            onClose={onCloseClick}
            // onKeyDown={onEnterPress}
        >
            <ModalContainer isAddress={!!address}>
                {!!address && (
                    <>
                        <DelegateTitle>{t('components.delegate.current_delegate')}</DelegateTitle>
                        <AddressContainer>
                            <TezosAddress address={address} size="16px" color="primary" color2="index0" weight={300} />
                        </AddressContainer>
                    </>
                )}
                <InputAddressContainer>
                    <InputAddress
                        label={t('components.delegateConfirmationModal.new_address_label')}
                        operationType="delegate"
                        tooltip={false}
                        onChange={onAddressChange}
                        onIssue={onDelegateIssue}
                    />
                </InputAddressContainer>
                <FeesContainer>
                    <Fees
                        low={averageFees.low}
                        medium={averageFees.medium}
                        high={averageFees.high}
                        fee={fee}
                        miniFee={miniFee}
                        onChange={handleFeeChange}
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
                </FeesContainer>
                <WarningContainer>
                    <TezosIcon iconName="info" size={ms(5)} color="info" />
                    <InfoText>{t('components.delegateConfirmationModal.delegate_warning')}</InfoText>
                </WarningContainer>
            </ModalContainer>
            <BottomContainer>
                {!isLedger && (
                    <PasswordInput
                        label={t('general.nouns.wallet_password')}
                        password={password}
                        onChange={handlePasswordChange}
                        containerStyle={{ width: '60%', marginTop: '10px' }}
                    />
                )}
                <DelegateButton buttonTheme="primary" disabled={isDisabled} small onClick={onDelegate}>
                    {t('components.delegate.change_delegate')}
                </DelegateButton>
            </BottomContainer>
            {isLoading && <Loader />}
        </Modal>
    );
};

export default DelegateConfirmationModal;
