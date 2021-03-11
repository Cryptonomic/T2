import React from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { BeaconMessageType, Network, PermissionScope, PermissionResponseInput } from '@airgap/beacon-sdk';

import { getSelectedKeyStore } from '../../utils/general';
import { getMainNode, getMainPath } from '../../utils/settings';
import Loader from '../../components/Loader';
import { RootState, ModalState } from '../../types/store';

import { setBeaconLoading } from '../../reduxContent/app/actions';
import { createMessageAction } from '../../reduxContent/message/actions';
import { beaconClient } from './BeaconMessageRouter';

import { ModalWrapper, ModalContainer, CloseIconWrapper, Container, ButtonContainer, InvokeButton, Footer, WhiteBtn } from '../style';

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

const BeaconPermission = ({ open, onClose }: Props) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { selectedParentHash, isLedger } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
    const { identities } = useSelector((rootState: RootState) => rootState.wallet, shallowEqual);
    const { settings } = useSelector((rootState: RootState) => rootState, shallowEqual);
    const activeModal = useSelector<RootState, string>((state: RootState) => state.modal.activeModal);
    const modalValues = useSelector<RootState, ModalState>((state) => state.modal.values, shallowEqual);
    const beaconLoading = useSelector((state: RootState) => state.app.beaconLoading);

    const derivationPath = isLedger ? getMainPath(settings.pathsList, settings.selectedPath) : '';
    const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger, derivationPath);
    const connectedBlockchainNode = getMainNode(settings.nodesList, settings.selectedNode);

    const onAllow = async () => {
        try {
            dispatch(setBeaconLoading(true));
            const authorizationScope = modalValues[activeModal].scopes.join(', ');
            const authorizationRequestId = modalValues[activeModal].id;
            const response: PermissionResponseInput = {
                type: BeaconMessageType.PermissionResponse,
                network: { type: connectedBlockchainNode.network } as Network,
                scopes: authorizationScope.split(', ') as PermissionScope[],
                id: authorizationRequestId,
                publicKey: keyStore.publicKey,
            };
            await beaconClient.respond(response);
            const permissions = await beaconClient.getPermissions();
            dispatch(setBeaconLoading());
            if (!permissions.length && !permissions.find((p) => p.address === keyStore.publicKeyHash)) {
                throw Error('No permission');
            }
            onClose();
        } catch (e) {
            console.log('BeaconPermissionError', e);
            dispatch(setBeaconLoading());
            dispatch(createMessageAction(`Beacon permission failure - ${e.message || e}`, true));
        }
    };

    return (
        <ModalWrapper open={open}>
            {open ? (
                <ModalContainer>
                    <CloseIconWrapper onClick={() => onClose()} />
                    <Container>
                        <div className="modal-holder">
                            <h3>{t('components.Beacon.permission.title', { network: modalValues[activeModal].network.type })}</h3>
                            <p>{`${modalValues[activeModal].appMetadata.name} is requesting the following permissions:`}</p>
                            <ul>
                                {modalValues[activeModal].scopes.map((s: string) => {
                                    return <li key={s}>{t(`components.Beacon.info.permissions.${s}`)}</li>;
                                })}
                            </ul>
                            <p className="subtitleText mr-t-100 text-center">Always make sure you trust the sites you interact with.</p>
                        </div>
                    </Container>
                    {beaconLoading && <Loader />}
                    <Footer>
                        <ButtonContainer>
                            <WhiteBtn buttonTheme="secondary" onClick={() => onClose()}>
                                {t('general.verbs.cancel')}
                            </WhiteBtn>
                            <InvokeButton buttonTheme="primary" onClick={() => !beaconLoading && onAllow()}>
                                {t('general.verbs.allow')}
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

export default BeaconPermission;
