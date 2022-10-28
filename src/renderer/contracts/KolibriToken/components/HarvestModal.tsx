import React, { useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from '../../../components/Button';
import { RootState, AppState } from '../../../types/store';
import { ModalWrapper, ModalContainer, CloseIconWrapper, ModalTitle } from '../../../featureModals/style';

import PasswordInput from '../../../components/PasswordInput';

import { harvestRewards } from '../thunks';

const PromptContainer = styled.div`
    align-items: center;
    color: #979797;
    display: flex;
    font-size: 24px;
    justify-content: center;
    height: 80px;
    margin-top: 30px;
    width: 100%;
`;

const Container = styled.div`
    padding: 0 32px 20px;
    .title {
        font-weight: 500;
        font-size: 18px;
        line-height: 21px;
        margin-top: 24px;
    }
    .items {
        max-height: 480px;
        overflow-y: scroll;
    }
`;

const PasswordContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    height: 100px;
    margin-top: auto;
    width: 100%;
`;

const InvokeButton = styled(Button)`
    width: 194px;
    height: 50px;
    margin-bottom: 10px;
    margin-left: auto;
    padding: 0;
`;

interface Props {
    open: boolean;
    onClose: () => void;
}

const KolibriHarvestModal = ({ open, onClose }: Props) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { isLedger } = useSelector<RootState, AppState>((state: RootState) => state.app, shallowEqual);

    const [passPhrase, setPassPhrase] = useState('');

    const isDisabled = !passPhrase && !isLedger;

    const onHarvest = async () => {
        dispatch(harvestRewards(passPhrase));
        onClose();
    };

    return (
        <ModalWrapper open={open}>
            {open ? (
                <ModalContainer>
                    <CloseIconWrapper onClick={() => onClose()} />
                    <ModalTitle>{t('components.plenty.modal.harvestTitle')}</ModalTitle>
                    <Container>
                        <PasswordContainer>
                            {!isLedger && (
                                <PasswordInput
                                    label={t('general.nouns.wallet_password')}
                                    password={passPhrase}
                                    onChange={(val) => setPassPhrase(val)}
                                    containerStyle={{ width: '60%', marginTop: '10px' }}
                                />
                            )}
                            <InvokeButton buttonTheme="primary" disabled={isDisabled} onClick={onHarvest}>
                                {t('components.plenty.verbs.harvest')}
                            </InvokeButton>
                        </PasswordContainer>
                    </Container>
                </ModalContainer>
            ) : (
                <ModalContainer />
            )}
        </ModalWrapper>
    );
};

export default KolibriHarvestModal;
