import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import Modal from '../../../../components/CustomModal';
import TezosAddress from '../../../../components/TezosAddress';
import sendImg from '../../../../../resources/imgs/Send.svg';
import confirmImg from '../../../../../resources/imgs/Confirm-Ledger.svg';
import Loader from '../../../../components/Loader';
import { formatAmount } from '../../../../utils/currency';
import TezosIcon from '../../../../components/TezosIcon';

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
    // Message to display.
    message: string;

    // Address of the vault, or undefined if operation on the core.
    vaultAddress: string | undefined;

    // Sender of the operation.
    source: string;

    // The fee, specificed in mutez.
    fee: number;

    // The amount, specified in mutez.
    amount: number;

    // Whether the modal is loading.
    isLoading: boolean;

    // Whether the modal is open.
    open: boolean;

    // A function to close the modal.
    onClose: () => void;
}

const LedgerConfirmModal = (props: Props) => {
    const { t } = useTranslation();

    return (
        // TODO(keefertaylor): Use translations
        <Modal title={'Confirm Operation'} open={props.open} onClose={props.onClose}>
            <MainContainer>
                <DescriptionContainer>
                    <SendSvg src={sendImg} />
                    <SendDes>{props.message}</SendDes>
                </DescriptionContainer>

                <ItemContainer>
                    <ItemTitle>{t('general.nouns.source')}</ItemTitle>
                    <TezosAddress address={props.source} size="16px" weight={300} color="primary" />
                </ItemContainer>

                <ItemContainer>
                    <ItemTitle>{t('general.nouns.fee')}</ItemTitle>
                    <ItemContent>
                        {formatAmount(props.fee)}
                        <TezosIcon color="secondary" iconName="tezos" />
                    </ItemContent>
                </ItemContainer>

                <ItemContainer>
                    <ItemTitle>{t('general.nouns.amount')}</ItemTitle>
                    <ItemContent>
                        {formatAmount(props.amount)}
                        <TezosIcon color="secondary" iconName="tezos" />
                    </ItemContent>
                </ItemContainer>

                {props.vaultAddress && (
                    <ItemContainer>
                        {/* TODO(keefertaylor): translations */}
                        <ItemTitle> {'Vault'}</ItemTitle>
                        <TezosAddress address={props.vaultAddress} size="16px" weight={300} color="primary" />
                    </ItemContainer>
                )}
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
            {props.isLoading && <Loader />}
        </Modal>
    );
};

export default LedgerConfirmModal;
