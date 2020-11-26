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
    source: string;
    open: boolean;
    onClose: () => void;
    isLoading: boolean;
    fee: number;
    amount: string;
    parameters: string;
}

const DeployLedgerConfirmationModal = (props: Props) => {
    const { t } = useTranslation();
    const { source, open, isLoading, onClose, fee, amount, parameters } = props;

    const calcFee = formatAmount(fee);

    return (
        <Modal title={t('components.deployLedgerConfirmationModal.confirm_deploy_title')} open={open} onClose={onClose}>
            <MainContainer>
                <DescriptionContainer>
                    <SendSvg src={sendImg} />
                    <SendDes>
                        <SendDesTitle>{t('components.deployLedgerConfirmationModal.deploy_description_1')}</SendDesTitle>
                        {t('components.deployLedgerConfirmationModal.deploy_description_2')}
                    </SendDes>
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
                    <ItemTitle>{t('components.interactModal.deploy_from')}</ItemTitle>
                    <TezosAddress address={source} size="16px" weight={300} color="primary" />
                </ItemContainer>

                <ItemContainer>
                    <ItemTitle>{t('components.interactModal.initial_storage')}</ItemTitle>
                    <ItemContent>{parameters}</ItemContent>
                </ItemContainer>
            </MainContainer>
            <BottomContainer>
                <ConfirmDes>
                    <Trans i18nKey="components.deployLedgerConfirmationModal.deploy_confirm">
                        Please
                        <ConfirmSpan>confirm</ConfirmSpan> the deployment on your device at your own risk.
                    </Trans>
                </ConfirmDes>
                <ConfirmImg src={confirmImg} />
            </BottomContainer>
            {isLoading && <Loader />}
        </Modal>
    );
};

export default DeployLedgerConfirmationModal;
