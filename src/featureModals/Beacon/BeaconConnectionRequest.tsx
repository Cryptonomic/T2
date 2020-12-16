import React from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import beaconReq from '../../../resources/imgs/beaconRequest.svg';

import { setBeaconLoading } from '../../reduxContent/app/actions';
import { createMessageAction } from '../../reduxContent/message/actions';

import { beaconClient } from './BeaconConnect';
import Loader from '../../components/Loader';
import { RootState, ModalState } from '../../types/store';

import { ModalWrapper, ModalContainer, Container, ButtonContainer, InvokeButton, Footer, WhiteBtn } from '../style';

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

const BeaconConnectionRequest = ({ open, onClose }: Props) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const activeModal = useSelector<RootState, string>((state: RootState) => state.modal.activeModal);
    const modalValues = useSelector<RootState, ModalState>((state) => state.modal.values, shallowEqual);
    const beaconLoading = useSelector<RootState>((state) => state.app.beaconLoading);

    const onConnect = async () => {
        try {
            dispatch(setBeaconLoading(true));
            const beaconRequest = modalValues[activeModal];
            await beaconClient.addPeer(beaconRequest);
        } catch (e) {
            console.log('BeaconConnectionRequestError', e);
            dispatch(setBeaconLoading());
            dispatch(createMessageAction('Beacon: connection request fails', true));
        }
    };

    return (
        <ModalWrapper open={open}>
            {open ? (
                <ModalContainer>
                    <Container>
                        <div className="modal-holder">
                            <h3>{t('components.Beacon.connection.title')}</h3>
                            <div>
                                <img src={beaconReq} />
                            </div>
                            <h4>Network: Mainnet</h4>
                            <p className="linkAddress">https://app.dexter.exchange/</p>
                            <p className="text-center">Dexter would like to connect to your wallet </p>
                            <p className="subtitleText text-center mr-t-100">
                                This site is requesting access to view your account address. Always make sure you trust the sites you interact with.
                            </p>
                        </div>
                    </Container>
                    {beaconLoading && <Loader />}
                    <Footer>
                        <ButtonContainer>
                            <WhiteBtn buttonTheme="secondary" onClick={() => !beaconLoading && onClose()}>
                                {t('general.verbs.cancel')}
                            </WhiteBtn>
                            <InvokeButton buttonTheme="primary" onClick={() => !beaconLoading && onConnect()}>
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
