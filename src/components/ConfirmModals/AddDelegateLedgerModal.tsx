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
} from './style';

interface Props {
    amount: string;
    address: string;
    source: string;
    manager: string;
    open: boolean;
    onClose: () => void;
    isLoading: boolean;
    fee: number;
}

const AddDelegateLedgerModal = (props: Props) => {
    const { amount, address, source, manager, open, isLoading, onClose, fee } = props;
    const { t } = useTranslation();
    const calcFee = formatAmount(fee);

    return (
        <Modal title={t('components.delegationLedgerConfirmationModal.confirm_delegate_title')} open={open} onClose={onClose}>
            <MainContainer>
                <DescriptionContainer>
                    <SendSvg src={sendImg} />
                    <SendDes>{t('components.delegationLedgerConfirmationModal.add_description')}</SendDes>
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
                    <ItemTitle>{t('general.nouns.source')}</ItemTitle>
                    <TezosAddress address={manager} size="16px" weight={300} color="primary" />
                </ItemContainer>

                <ItemContainer>
                    <ItemTitle>{t('general.nouns.manager')}</ItemTitle>
                    <TezosAddress address={source} size="16px" weight={300} color="primary" />
                </ItemContainer>

                <ItemContainer>
                    <ItemTitle>{t('general.nouns.delegate')}</ItemTitle>
                    <TezosAddress address={address} size="16px" weight={300} color="primary" />
                </ItemContainer>

                <ItemContainer>
                    <ItemTitle>{t('general.nouns.storage')}</ItemTitle>
                    <ItemContent>277</ItemContent>
                </ItemContainer>
            </MainContainer>
            <BottomContainer>
                <ConfirmDes>
                    <Trans i18nKey="components.delegationLedgerConfirmationModal.confirm_description">
                        If the all the details are correct, please
                        <ConfirmSpan>confirm</ConfirmSpan> the origination on your device.
                    </Trans>
                </ConfirmDes>
                <ConfirmImg src={confirmImg} />
            </BottomContainer>
            {isLoading && <Loader />}
        </Modal>
    );
};

export default AddDelegateLedgerModal;
