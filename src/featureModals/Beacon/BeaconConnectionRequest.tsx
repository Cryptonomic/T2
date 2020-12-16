import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import {
    WalletClient,
    BeaconMessageType,
    Network,
    PermissionScope,
    PermissionResponseInput,
    OperationResponseInput,
    TezosTransactionOperation,
} from '@airgap/beacon-sdk';
import beaconReq from '../../../resources/imgs/beaconRequest.svg';

import { connectBeaconThunk } from '../../reduxContent/app/thunks';
import { getSelectedKeyStore } from '../../utils/general';
import { getMainNode, getMainPath } from '../../utils/settings';
import { ms } from '../../styles/helpers';
import { openLink } from '../../utils/general';
import Loader from '../../components/Loader';
import Tooltip from '../../components/Tooltip';
import { RootState, ModalState } from '../../types/store';

import {
    ModalWrapper,
    ModalContainer,
    CloseIconWrapper,
    ModalTitle,
    Container,
    MainContainer,
    ButtonContainer,
    ResultContainer,
    InvokeButton,
    Result,
    LinkIcon,
    LinkContainer,
    ContentTitle,
    ContentSubtitle,
    Footer,
    TitleContainer,
    TooltipContent,
    WhiteBtn,
} from '../style';

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
    onNext: () => void;
}

const BeaconConnectionRequest = (props: Props) => {
    const { open, onClose, onNext } = props;
    const { t } = useTranslation();
    const { isLoading } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
    return (
        <ModalWrapper open={open}>
            {open ? (
                <ModalContainer>
                    <CloseIconWrapper onClick={() => onClose()} />
                    {/* <ModalTitle>{t('components.Beacon.registrationModal.title')}</ModalTitle> */}
                    <Container>
                        <div className="modal-holder">
                            <h3>Connection Request</h3>
                            <div>
                                <img src={beaconReq} />
                                {/* <span className="divider"></span>
                        <img src="./beaconRequest.svg" /> */}
                            </div>
                            <h4>Network: Mainnet</h4>
                            <p className="linkAddress">https://app.dexter.exchange/</p>
                            <p className="text-center">Dexter would like to connect to your wallet </p>
                            <p className="subtitleText text-center mr-t-100">
                                This site is requesting access to view your account address. Always make sure you trust the sites you interact with.
                            </p>
                        </div>
                    </Container>
                    {isLoading && <Loader />}
                    <Footer>
                        <ButtonContainer>
                            <WhiteBtn buttonTheme="secondary">{t('general.verbs.cancel')}</WhiteBtn>
                            <InvokeButton buttonTheme="primary" onClick={() => onNext()}>
                                {t('general.verbs.connect')}
                            </InvokeButton>
                        </ButtonContainer>
                    </Footer>
                </ModalContainer>
            ) : (
                <ModalContainer />
            )}
        </ModalWrapper>
    );
};

export default BeaconConnectionRequest;
