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
    WhiteBtn,
    Result,
    LinkIcon,
    LinkContainer,
    ContentTitle,
    ContentSubtitle,
    Footer,
    TitleContainer,
    TooltipContent,
} from '../style';
import { setModalOpen } from '../../reduxContent/modal/actions';

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

const BeaconAuthorize = ({ open, onClose }: Props) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { selectedParentHash, isLedger, signer } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
    const { identities } = useSelector((rootState: RootState) => rootState.wallet, shallowEqual);
    const { settings } = useSelector((rootState: RootState) => rootState, shallowEqual);
    const activeModal = useSelector<RootState, string>((state: RootState) => state.modal.activeModal);
    const modalValues = useSelector<RootState, ModalState>((state) => state.modal.values, shallowEqual);
    const beaconClient = useSelector<RootState, WalletClient>((state: RootState) => state.app.beaconClient);
    const [loading, setLoading] = useState(false);

    const derivationPath = isLedger ? getMainPath(settings.pathsList, settings.selectedPath) : '';
    const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger, derivationPath);
    const connectedBlockchainNode = getMainNode(settings.nodesList, settings.selectedNode);

    const onAuthorize = async () => {
        setLoading(true);
        const authorizationScope = modalValues[activeModal].scopes.join(', ');
        const authorizationRequestId = modalValues[activeModal].id;
        const response: PermissionResponseInput = {
            type: BeaconMessageType.PermissionResponse,
            network: { type: connectedBlockchainNode.network } as Network,
            scopes: authorizationScope.split(', ') as PermissionScope[],
            id: authorizationRequestId,
            publicKey: keyStore.publicKey,
        };

        try {
            await beaconClient.respond(response);
        } catch (e) {
            console.log('BeaconAuthorize error', e);
            setLoading(false);
        }
    };

    return (
        <ModalWrapper open={open}>
            {open ? (
                <ModalContainer>
                    {/* <CloseIconWrapper onClick={() => onClose()} /> */}
                    {/* <ModalTitle>{t('components.Beacon.registrationModal.title')}</ModalTitle> */}
                    <Container>
                        <div className="modal-holder">
                            <h3>Authorize Operations</h3>
                            <div>
                                <img src={beaconReq} />
                                {/* <span className="divider"></span>
                        <img src="./beaconRequest.svg" /> */}
                            </div>
                            <h4>Network: Mainnet</h4>
                            <p className="linkAddress">https://app.dexter.exchange/</p>
                            <p>
                                Dexter is requesting to send a transaction of <strong>[amount]</strong> <strong>[unit]</strong> to{' '}
                                <strong>tz1irJKkXS2DBWkU1NnmFQx1c1L7pbGg4yhk</strong> with the following parameters:{' '}
                            </p>
                            <ul>
                                <li>Parameter 1</li>
                                <li>Parameter 1</li>
                            </ul>
                            <p className="subtitleText">To see more parameters, view the operation details below</p>
                            <p className="fontWeight400">Operations</p>
                            <textarea className="inputField"/>
                            <p className="subtitleText">
                                Authorizing will allow this site to carry out this operation for you. Always make sure you trust the sites you interact with.
                            </p>
                        </div>
                    </Container>
                    {loading && <Loader />}
                    <Footer>
                        <ButtonContainer>
                            <WhiteBtn buttonTheme="secondary" onClick={onClose}>
                                {t('general.verbs.cancel')}
                            </WhiteBtn>
                            <InvokeButton buttonTheme="primary" onClick={onAuthorize}>
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

export default BeaconAuthorize;
