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

import { setModalOpen, setModalValue, clearModal } from '../../reduxContent/modal/actions';

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
}

const BeaconConnectionRequest = ({ open, onClose }: Props) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { settings } = useSelector((rootState: RootState) => rootState, shallowEqual);
    const beaconClient = useSelector<RootState, WalletClient>((state: RootState) => state.app.beaconClient);
    const activeModal = useSelector<RootState, string>((state: RootState) => state.modal.activeModal);
    const modalValues = useSelector<RootState, ModalState>((state) => state.modal.values, shallowEqual);
    const [loading, setLoading] = useState(false);
    const [requestor, setRequestor] = useState('');
    const [requestorRelay, setRequestorRelay] = useState('');
    const [requestorKey, setRequestorKey] = useState('');
    const [authorizationRequestId, setAuthorizationRequestId] = useState('');
    const [authorizationScope, setAuthorizationScope] = useState('');

    const connectedBlockchainNode = getMainNode(settings.nodesList, settings.selectedNode);

    const onConnect = async () => {
        setLoading(true);
        const beaconRequest = modalValues[activeModal];
        await beaconClient.addPeer(beaconRequest);
        await beaconClient
            .connect(async (message) => {
                // THIS METHOD NEEDS TO BE A GLOBAL LISTNER
                if (message.type === BeaconMessageType.PermissionRequest) {
                    console.log('BeaconRegistration.onConnect, permissions request', message);
                    if (connectedBlockchainNode.network !== message.network.type) {
                        // TODO: error network mismatch
                    }

                    if (requestorKey !== message.appMetadata.senderId) {
                        // TODO: error requestor key mismatch
                    }
                    setLoading(false);
                    dispatch(setModalValue(message, 'beaconAuthorize'));
                    dispatch(setModalOpen(false, 'beaconRegistration'));
                    dispatch(setModalOpen(true, 'beaconAuthorize'));
                    // setAuthorizationRequestId(message.id);
                    // setAuthorizationScope(message.scopes.join(', '));
                }
            })
            .catch((err) => {
                console.error('connect error', err);
                setLoading(false);
            });
    };

    useEffect(() => {
        const req = modalValues[activeModal];
        if (req) {
            setRequestor(req.name);
            setRequestorRelay(req.relayServer);
            setRequestorKey(req.publicKey);
        }
    }, []);

    return (
        <ModalWrapper open={open}>
            {open ? (
                <ModalContainer>
                    {/* <CloseIconWrapper onClick={onClose} />ele */}
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
                    {loading && <Loader />}
                    <Footer>
                        <ButtonContainer>
                            <WhiteBtn buttonTheme="secondary" onClick={() => !loading && onClose()}>
                                {t('general.verbs.cancel')}
                            </WhiteBtn>
                            <InvokeButton buttonTheme="primary" onClick={() => !loading && onConnect()}>
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
