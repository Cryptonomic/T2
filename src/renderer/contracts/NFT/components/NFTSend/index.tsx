import React, { FunctionComponent, useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { OperationKindType } from 'conseiljs';

import {
    BalanceContent,
    BalanceSummaryContainer,
    BalanceTitle,
    BoldSpan,
    BottomRow,
    CustomDivider,
    FeeContainer,
    FeeTooltipBtn,
    LeftCol,
    MediaStyled,
    PasswordContainer,
    RightCol,
    Row,
    SendForm,
    SubmitButton,
    TooltipContainer,
    TooltipContent,
    TooltipTitle,
} from './style';

import { transferNFT } from '../../thunks';
import { NFTSendProps } from '../../types';

import { AmountContainer, ModalContainer } from '../../../components/style';
import { getAccountSelector } from '../../../duck/selectors';

import Fees from '../../../../components/Fees';
import InputAddress from '../../../../components/InputAddress';
import InputError from '../../../../components/InputError';
import PasswordInput from '../../../../components/PasswordInput';
import QuantityInput from '../../../../components/QuantityInput';
import TextField from '../../../../components/TextField';
import TezosAmount from '../../../../components/TezosAmount';
import TezosIcon from '../../../../components/TezosIcon';
import Tooltip from '../../../../components/Tooltip';

import { AVERAGEFEES } from '../../../../constants/FeeValue';
import { READY } from '../../../../constants/StatusTypes';

import { RootState } from '../../../../types/store';

import { useFetchFees } from '../../../../reduxContent/app/thunks';
import { createMessageAction } from '../../../../reduxContent/message/actions';

import { ms } from '../../../../styles/helpers';

/**
 * The content of the "Send" tab of the NFT modal.
 *
 * @param {NFTObject} [nftObject] - the NFT object with all details.
 */
export const NFTSend: FunctionComponent<NFTSendProps> = ({ nftObject, closeModal }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [address, setAddress] = useState('');
    const [isAddressIssue, setIsAddressIssue] = useState(false);
    const [amount, setAmount] = useState<number>(nftObject && nftObject.amount > 0 ? 1 : 0);
    const [fee, setFee] = useState(AVERAGEFEES.medium);
    const [total, setTotal] = useState(AVERAGEFEES.medium);
    const [remainingBalance, setRemainingBalance] = useState(0);
    const [password, setPassword] = useState('');

    const { balance, status } = useSelector(getAccountSelector);
    const { newFees, miniFee, isFeeLoaded, isRevealed } = useFetchFees(OperationKindType.Transaction, true);
    const { isLedger, selectedAccountHash } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
    const { walletPassword } = useSelector((rootState: RootState) => rootState.wallet, shallowEqual);

    /**
     * Update "fee" and "total" when fees are loaded:
     */
    useEffect(() => {
        setFee(newFees.medium);
        setTotal(newFees.medium);
    }, [isFeeLoaded]);

    /**
     * Update "total" whenever "fee" changes:
     */
    useEffect(() => {
        setTotal(fee);
    }, [fee]);

    /**
     * Update "remainingBalance" whenever the total has been changed:
     */
    useEffect(() => {
        setRemainingBalance(balance - total);
    }, [total]);

    /**
     * Submit the form:
     */
    const onSubmit = (e) => {
        e.preventDefault();

        if (!nftObject) {
            return;
        }

        if (password !== walletPassword && !isLedger) {
            const passerror = 'components.messageBar.messages.incorrect_password';
            dispatch(createMessageAction(passerror, true));
            return;
        }

        dispatch(transferNFT(nftObject.tokenAddress, address, amount, nftObject.objectId, password, fee));

        closeModal();
    };

    /**
     * Check if there is enough funds to perform the transfer.
     */
    function getBalanceState() {
        const realAmount = !amount ? Number(amount) : 0;
        if (remainingBalance <= 0 || balance < realAmount) {
            return {
                isIssue: true,
                warningMessage: t('components.send.warnings.total_exceeds'),
                balanceColor: 'error1',
            };
        }
        return {
            isIssue: false,
            warningMessage: '',
            balanceColor: 'gray8',
        };
    }

    /**
     * Is the selected fee a custom fee entered by the user?
     */
    function isCustomFee() {
        return !Object.keys(newFees)
            .map((f) => newFees[f])
            .includes(fee);
    }

    /**
     * Renders the ToolTip icon and box.
     * @param {JSX.Element} content - the content of the ToolTip box
     */
    function renderFeeToolTipWrapper(content: JSX.Element) {
        return (
            <Tooltip position="right" content={content}>
                <FeeTooltipBtn size="small">
                    <TezosIcon iconName="help" size={ms(1)} color="gray5" />
                </FeeTooltipBtn>
            </Tooltip>
        );
    }

    /**
     * Build the ToolTip content.
     * If fees has not been revealed, render the warning.
     * If fees has been revealed and the user entered custom fee,
     * let him know that the application already calculated the optimal fee.
     */
    function renderFeeToolTip() {
        if (!isRevealed) {
            return renderFeeToolTipWrapper(
                <TooltipContainer>
                    <TooltipTitle>{t('components.send.fee_tooltip_title')}</TooltipTitle>
                    <TooltipContent>
                        <Trans i18nKey="components.send.fee_tooltip_content">
                            This address is not revealed on the blockchain. We have added
                            <BoldSpan>0.001420 XTZ</BoldSpan> for Public Key Reveal to your regular send operation fee.
                        </Trans>
                    </TooltipContent>
                </TooltipContainer>
            );
        } else if (isRevealed && isCustomFee()) {
            return renderFeeToolTipWrapper(
                <TooltipContainer>
                    <TooltipContent>{t('components.nftGallery.custom_fee_tooltip')}</TooltipContent>
                </TooltipContainer>
            );
        }

        return null;
    }

    /**
     * Rescue when the nftObject is undefined.
     */
    if (!nftObject) {
        return <div />;
    }

    const isReady = status === READY;
    const { isIssue, warningMessage, balanceColor } = getBalanceState();
    const error = isIssue ? <InputError error={warningMessage} /> : null;
    const isDisabled = amount === 0 || !amount || !address || isAddressIssue || isIssue || !isReady || !password;

    return (
        <ModalContainer>
            <SendForm name="send_nft" onSubmit={onSubmit}>
                <Row>
                    <LeftCol>
                        <InputAddress
                            label={t('components.nftGallery.modal.recipient_address')}
                            address={selectedAccountHash}
                            operationType="send_babylon" // TODO: add correct operation type
                            onChange={(v) => setAddress(v)}
                            onIssue={(err) => setIsAddressIssue(err)}
                        />
                        <CustomDivider />
                        <TextField
                            label={t('components.nftGallery.modal.token')}
                            value={`${t('components.nftGallery.modal.token')} ${nftObject.objectId.toString()}`}
                            readOnly={true}
                        />
                        <FeeContainer>
                            <Fees
                                low={newFees.low}
                                medium={newFees.medium}
                                high={newFees.high}
                                fee={fee}
                                miniFee={miniFee}
                                onChange={(v) => setFee(v)}
                                tooltip={renderFeeToolTip()}
                            />
                        </FeeContainer>
                        {error}

                        <BalanceSummaryContainer>
                            <div>
                                <BalanceTitle>{t('general.nouns.total')}</BalanceTitle>
                                <TezosAmount weight="500" color={amount ? 'gray3' : 'gray8'} size={ms(0.65)} amount={total} />
                            </div>
                            <BalanceContent>
                                <BalanceTitle>{t('general.nouns.remaining_balance')}</BalanceTitle>
                                <TezosAmount weight="500" color={balanceColor} size={ms(0.65)} amount={remainingBalance} />
                            </BalanceContent>
                        </BalanceSummaryContainer>
                    </LeftCol>
                    <RightCol>
                        <MediaStyled
                            source={nftObject.artifactUrl || ''}
                            type={nftObject.artifactType}
                            alt={nftObject.name}
                            enablePreview={false}
                            useNFTFailedBox={true}
                            nftProvider={nftObject.provider}
                            thumbProps={{
                                thumbnailUri: nftObject.thumbnailUri,
                            }}
                        />
                        <AmountContainer>
                            <QuantityInput label={t('general.nouns.quantity')} min={1} max={nftObject.amount} value={amount} onChange={(v) => setAmount(v)} />
                        </AmountContainer>
                    </RightCol>
                </Row>
                <BottomRow>
                    <LeftCol>
                        <PasswordContainer>
                            {!isLedger && (
                                <PasswordInput
                                    label={t('general.nouns.wallet_password')}
                                    password={password}
                                    onChange={(val) => setPassword(val)}
                                    containerStyle={{ width: '100%', maxWidth: '500px' }}
                                />
                            )}
                        </PasswordContainer>
                    </LeftCol>
                    <RightCol>
                        <SubmitButton type="submit" buttonTheme="primary" disabled={isDisabled}>
                            {t('components.nftGallery.modal.send')}
                        </SubmitButton>
                    </RightCol>
                </BottomRow>
            </SendForm>
        </ModalContainer>
    );
};
