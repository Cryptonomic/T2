import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import Modal from '../CustomModal';
import Loader from '../Loader';
import TezosAddress from '../TezosAddress';
import TezosIcon from '../TezosIcon';
import sendImg from '../../../resources/imgs/Send.svg';
import confirmImg from '../../../resources/imgs/Confirm-Ledger.svg';
import { formatAmount } from '../../utils/currency';

import {
    MainContainer,
    DescriptionContainer,
    SendSvg,
    SendDes,
    ItemContainer,
    BottomContainer,
    ConfirmImg,
    ConfirmDes,
    ConfirmSpan,
    ItemTitle,
    ItemContent,
    SendDesTitle,
} from './style';

interface Props {
    address: string;
    source: string;
    open: boolean;
    onClose: () => void;
    isLoading: boolean;
    fee: number;
    amount: string;
    parameters: string;
    storage: number;
}

const InvokeLedgerConfirmationModal = (props: Props) => {
    const { address, source, open, isLoading, onClose, fee, amount, parameters, storage } = props;
    const { t } = useTranslation();
    const calcFee = formatAmount(fee);

    return (
        <Modal title={t('components.invokeLedgerConfirmationModal.confirm_invoke_title')} open={open} onClose={onClose}>
            <MainContainer>
                <DescriptionContainer>
                    <SendSvg src={sendImg} />
                    {parameters === '' ? (
                        <SendDes>{t('components.invokeLedgerConfirmationModal.invoke_description')}</SendDes>
                    ) : (
                        <SendDes>
                            <SendDesTitle>{t('components.invokeLedgerConfirmationModal.invoke_alt_description_1')}</SendDesTitle>
                            {t('components.invokeLedgerConfirmationModal.invoke_alt_description_2')}
                        </SendDes>
                    )}
                </DescriptionContainer>

                <ItemContainer>
                    <ItemTitle>{t('general.nouns.amount')}</ItemTitle>
                    <ItemContent>
                        {amount}
                        <TezosIcon color="secondary" iconName="tezos" />
                    </ItemContent>
                </ItemContainer>

                <ItemContainer>
                    <ItemTitle>{t('general.nouns.fee')}</ItemTitle>
                    <ItemContent>
                        {calcFee}
                        <TezosIcon color="secondary" iconName="tezos" />
                    </ItemContent>
                </ItemContainer>

                <ItemContainer>
                    <ItemTitle>{t('components.interactModal.invoke_from')}</ItemTitle>
                    <TezosAddress address={source} size="16px" weight={300} color="primary" />
                </ItemContainer>

                <ItemContainer>
                    <ItemTitle>{t('general.nouns.smart_contract')}</ItemTitle>
                    <TezosAddress address={address} size="16px" weight={300} color="primary" />
                </ItemContainer>

                {parameters === '' ? (
                    <ItemContainer>
                        <ItemTitle>{t('general.nouns.storage')}</ItemTitle>
                        <ItemContent>{storage}</ItemContent>
                    </ItemContainer>
                ) : (
                    <ItemContainer>
                        <ItemTitle>{t('components.interactModal.parameters')}</ItemTitle>
                        <ItemContent>{parameters}</ItemContent>
                    </ItemContainer>
                )}
            </MainContainer>
            <BottomContainer>
                <ConfirmDes>
                    {parameters === '' ? (
                        <Trans i18nKey="components.invokeLedgerConfirmationModal.invoke_confirm">
                            If the all the details are correct, please
                            <ConfirmSpan>confirm</ConfirmSpan> the origination on your device.
                        </Trans>
                    ) : (
                        <Trans i18nKey="components.invokeLedgerConfirmationModal.invoke_alt_confirm">
                            Please
                            <ConfirmSpan>confirm</ConfirmSpan> the invocation on your device at your own risk.
                        </Trans>
                    )}
                </ConfirmDes>
                <ConfirmImg src={confirmImg} />
            </BottomContainer>
            {isLoading && <Loader />}
        </Modal>
    );
};

export default InvokeLedgerConfirmationModal;
