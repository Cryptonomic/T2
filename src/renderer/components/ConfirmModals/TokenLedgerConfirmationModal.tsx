import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import Modal from '../CustomModal';
import Loader from '../Loader';
import TezosAddress from '../TezosAddress';
import TezosIcon from '../TezosIcon';
import sendImg from '../../../resources/imgs/Send.svg';
import confirmImg from '../../../resources/imgs/Confirm-Ledger.svg';
import { formatAmount } from '../../utils/currency';

import { SEND } from '../../constants/TabConstants';

import {
    MainContainer,
    DescriptionContainer,
    SendSvg,
    SendDes,
    ItemContainer,
    BottomContainer2,
    ConfirmImg,
    ConfirmDes,
    ConfirmSpan,
    ItemTitle,
    ItemContent,
    SymbolTxt,
} from './style';

interface Props {
    amount: string;
    to: string;
    source: string;
    open: boolean;
    onClose: () => void;
    isLoading: boolean;
    fee: number;
    op: string;
    symbol: string;
}

const TokenLedgerConfirmationModal = (props: Props) => {
    const { amount, to, source, open, isLoading, onClose, fee, op, symbol } = props;
    const { t } = useTranslation();

    const calcFee = formatAmount(fee);

    const sourceTxt = op === SEND ? t('components.interactModal.deploy_from') : t('components.interactModal.invoke_from');
    const opTxt = t(op).toLocaleLowerCase();

    return (
        <Modal title={t('components.tokenLedgerConfirmModal.confirm_token')} open={open} onClose={onClose}>
            <MainContainer>
                <DescriptionContainer>
                    <SendSvg src={sendImg} />
                    <SendDes>{t('components.tokenLedgerConfirmModal.op_description', { op: opTxt })}</SendDes>
                </DescriptionContainer>

                <ItemContainer>
                    <ItemTitle>{sourceTxt}</ItemTitle>
                    <TezosAddress address={source} size="16px" weight={300} color="primary" />
                </ItemContainer>

                {op !== SEND && (
                    <ItemContainer>
                        <ItemTitle>{t('general.nouns.destination')}</ItemTitle>
                        <TezosAddress address={to} size="16px" weight={300} color="primary" />
                    </ItemContainer>
                )}

                <ItemContainer>
                    <ItemTitle>{t('general.nouns.amount')}</ItemTitle>
                    <ItemContent>
                        {amount}
                        <SymbolTxt>{symbol}</SymbolTxt>
                    </ItemContent>
                </ItemContainer>

                <ItemContainer>
                    <ItemTitle>{t('general.nouns.fee')}</ItemTitle>
                    <ItemContent>
                        {calcFee}
                        <TezosIcon color="secondary" iconName="tezos" />
                    </ItemContent>
                </ItemContainer>
            </MainContainer>
            <BottomContainer2>
                <ConfirmDes>
                    <Trans i18nKey="components.sendLedgerConfirmationModal.confirm_description">
                        If the all the details are correct, please
                        <ConfirmSpan>confirm</ConfirmSpan> the transaction on your device.
                    </Trans>
                </ConfirmDes>
                <ConfirmImg src={confirmImg} />
            </BottomContainer2>
            {isLoading && <Loader />}
        </Modal>
    );
};

export default TokenLedgerConfirmationModal;
