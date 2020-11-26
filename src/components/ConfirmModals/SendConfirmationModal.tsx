import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../CustomModal';
import Loader from '../Loader';
import TezosAddress from '../TezosAddress';
import TezosIcon from '../TezosIcon';
import PasswordInput from '../PasswordInput';
import sendImg from '../../../resources/imgs/Send.svg';
import { formatAmount } from '../../utils/currency';

import { MainContainer, DescriptionContainer, SendSvg, SendDes, ItemContainer, BottomContainer, ItemTitle, ItemContent, ConfirmButton } from './style';

interface Props {
    onEnterPress: (event) => void;
    amount: string;
    password: string;
    address: string;
    open: boolean;
    onClose: () => void;
    onPasswordChange: (val: string) => void;
    onSend: () => void;
    isLoading: boolean;
    source: string;
    fee: number;
    isBurn: boolean;
}

const SendConfirmationModal = (props: Props) => {
    const { onEnterPress, amount, address, open, isLoading, onPasswordChange, password, onClose, onSend, source, fee, isBurn } = props;
    const { t } = useTranslation();

    const isDisabled = isLoading || !password;

    const calcFee = formatAmount(fee);

    return (
        <Modal
            title={t('components.sendConfirmationModal.send_confirmation')}
            open={open}
            onClose={onClose}
            // onKeyDown={onEnterPress}
        >
            <MainContainer>
                <DescriptionContainer>
                    <SendSvg src={sendImg} />
                    <SendDes>{t('components.sendConfirmationModal.send_description')}</SendDes>
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

                {isBurn && (
                    <ItemContainer>
                        <ItemTitle>{t('general.nouns.burn')}</ItemTitle>
                        <ItemContent>
                            0.06425
                            <TezosIcon color="secondary" iconName="tezos" />
                        </ItemContent>
                    </ItemContainer>
                )}

                <ItemContainer>
                    <ItemTitle>{t('general.nouns.source')}</ItemTitle>
                    <TezosAddress address={source} size="16px" weight={300} color="primary" />
                </ItemContainer>

                <ItemContainer>
                    <ItemTitle>{t('general.nouns.destination')}</ItemTitle>
                    <TezosAddress address={address} size="16px" weight={300} color="primary" />
                </ItemContainer>
            </MainContainer>

            <BottomContainer>
                <PasswordInput
                    label={t('general.nouns.wallet_password')}
                    password={password}
                    onChange={onPasswordChange}
                    containerStyle={{ width: '55%', marginTop: '15px' }}
                />
                <ConfirmButton buttonTheme="primary" disabled={isDisabled} onClick={onSend}>
                    {t('general.verbs.confirm')}
                </ConfirmButton>
            </BottomContainer>
            {isLoading && <Loader />}
        </Modal>
    );
};

export default SendConfirmationModal;
