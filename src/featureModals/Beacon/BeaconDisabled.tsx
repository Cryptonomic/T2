import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { BeaconMessageType, BeaconErrorType, ErrorResponse } from '@airgap/beacon-sdk';
const { shell } = require('electron');

import config from '../../config.json';
import { RootState, ModalState } from '../../types/store';
import { ModalWrapper, ModalContainer, Container, ButtonContainer, Footer, WhiteBtn } from '../style';

import { beaconClient } from './BeaconMessageRouter';

export const PromptContainer = styled.div`
    align-items: center;
    color: #979797;
    display: flex;
    font-size: 24px;
    justify-content: center;
    height: 80px;
    margin-top: 30px;
    width: 100%;
`;

interface Props {
    open: boolean;
    onClose: () => void;
}

const BeaconDisabled = ({ open, onClose }: Props) => {
    const { t } = useTranslation();
    const activeModal = useSelector<RootState, string>((state: RootState) => state.modal.activeModal);
    const modalValues = useSelector<RootState, ModalState>((state) => state.modal.values, shallowEqual);

    const onCancel = async () => {
        try {
            const response: ErrorResponse = {
                id: modalValues.id || '',
                version: modalValues.version || '',
                senderId: modalValues.senderId || '',
                type: BeaconMessageType.Error,
                errorType: BeaconErrorType.ABORTED_ERROR,
            };
            await beaconClient.respond(response);
        } finally {
            onClose();
        }
    };

    const onLinkClick = async () => {
        await shell.openExternal(config.fullVersionUrl);
    };

    return (
        <ModalWrapper open={open}>
            {open ? (
                <ModalContainer>
                    <Container>
                        <div className="modal-holder">
                            <h3>{t('components.Beacon.disabled.title')}</h3>
                            <p className="text-center">{`${modalValues[activeModal].name} would like to connect to your wallet`}</p>
                            <p className="subtitleText text-center mr-t-100">
                                Due to App Store compliance requirements this functionality is not available in the App Store version. For the full{' '}
                                {config.name} experience, please{' '}
                                <a style={{ textDecoration: 'underline' }} onClick={onLinkClick}>
                                    download the app directly
                                </a>
                            </p>
                        </div>
                    </Container>
                    <Footer>
                        <ButtonContainer>
                            <WhiteBtn buttonTheme="secondary" onClick={() => onCancel()}>
                                {t('general.nouns.ok')}
                            </WhiteBtn>
                        </ButtonContainer>
                    </Footer>
                </ModalContainer>
            ) : (
                <ModalContainer />
            )}
        </ModalWrapper>
    );
};

export default BeaconDisabled;
