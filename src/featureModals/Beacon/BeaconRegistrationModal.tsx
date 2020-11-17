import React, { useState, useEffect } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
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
}

const BeaconRegistrationModal = (props: Props) => {
    const { t } = useTranslation();
    const { isLoading, selectedParentHash, isLedger, signer } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
    const { identities } = useSelector((rootState: RootState) => rootState.wallet, shallowEqual);
    const { settings } = useSelector((rootState: RootState) => rootState, shallowEqual);

    const beaconClient = useSelector<RootState, WalletClient>((state: RootState) => state.app.beaconClient);
    const activeModal = useSelector<RootState, string>((state: RootState) => state.modal.activeModal);
    const modalValues = useSelector<RootState, ModalState>((state) => state.modal.values, shallowEqual);

    const { open, onClose } = props;

    const [result, setResult] = useState('');
    const [error, setError] = useState(false);
    const [requestor, setRequestor] = useState('');
    const [requestorRelay, setRequestorRelay] = useState('');
    const [requestorKey, setRequestorKey] = useState('');
    const [authorizationRequestId, setAuthorizationRequestId] = useState('');
    const [authorizationScope, setAuthorizationScope] = useState('');

    const derivationPath = isLedger ? getMainPath(settings.pathsList, settings.selectedPath) : '';
    const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger, derivationPath);
    const connectedBlockchainNode = getMainNode(settings.nodesList, settings.selectedNode);

    const onConnect = async () => {
        // TODO: loading indicator
        console.log('BeaconRegistration.onConnect');
        const beaconRequest = modalValues[activeModal];
        await beaconClient.addPeer(beaconRequest);
        console.log('BeaconRegistration.onConnect, peer added');
        beaconClient
            .connect(async (message) => {
                if (message.type === BeaconMessageType.PermissionRequest) {
                    console.log('BeaconRegistration.onConnect, permissions request', message);
                    if (connectedBlockchainNode.network !== message.network.type) {
                        // TODO: error network mismatch
                    }

                    if (requestorKey !== message.appMetadata.senderId) {
                        // TODO: error requestor key mismatch
                    }

                    setAuthorizationRequestId(message.id);
                    setAuthorizationScope(message.scopes.join(', '));
                } else {
                    console.log('BeaconRegistration.onConnect, unexpected message', message);
                    // TODO: error unexpected message
                }
            })
            .catch((err) => console.error('connect error', err));
    };

    const onAuthorize = async () => {
        const response: PermissionResponseInput = {
            type: BeaconMessageType.PermissionResponse,
            network: { type: connectedBlockchainNode.network } as Network,
            scopes: authorizationScope.split(', ') as PermissionScope[],
            id: authorizationRequestId,
            publicKey: keyStore.publicKey,
        };
        console.log('onAuthorize', response);
        await beaconClient.respond(response);
        onClose();
    };

    useEffect(() => {
        const req = modalValues[activeModal];
        if (req) {
            setRequestor(req.name);
            setRequestorRelay(req.relayServer);
            setRequestorKey(req.publicKey);
        }
    }, []);
    // TODO: below needs a cancel button next to the connect button and a deny button next to the grant button
    return (
        <ModalWrapper open={open}>
            {open ? (
                <ModalContainer>
                    <CloseIconWrapper onClick={() => onClose()} />
                    <ModalTitle>{t('components.Beacon.registrationModal.title')}</ModalTitle>
                    <Container>
                        <div>{requestor}</div>
                        <div>{requestorRelay}</div>

                        <div>{authorizationScope}</div>
                    </Container>
                    {isLoading && <Loader />}
                    <Footer>
                        <ButtonContainer>
                            <InvokeButton buttonTheme="primary" onClick={onConnect}>
                                {t('general.verbs.connect')}
                            </InvokeButton>
                            <InvokeButton buttonTheme="primary" onClick={onAuthorize}>
                                {t('general.verbs.authorize')}
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

export default BeaconRegistrationModal;
