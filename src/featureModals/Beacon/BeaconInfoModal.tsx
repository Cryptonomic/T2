import React, { useState, useEffect } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { WalletClient } from '@airgap/beacon-sdk';

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

const BeaconInfoModal = (props: Props) => {
    const { t } = useTranslation();
    const { isLoading, selectedParentHash, isLedger, signer } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
    const { identities } = useSelector((rootState: RootState) => rootState.wallet, shallowEqual);
    const { settings } = useSelector((rootState: RootState) => rootState, shallowEqual);

    // const beaconClient = useSelector<RootState, WalletClient>((state: RootState) => state.app.beaconClient);

    const { open, onClose } = props;

    const [beaconState, setBeaconState] = useState({});

    useEffect(() => {
        const beaconInfo = {};
        // const readState = async () => {
        //     const apps = await beaconClient.getAppMetadataList();
        //     for (const app of apps) {
        //         beaconInfo[app.senderId] = { name: app.name };
        //     }

        //     const permissions = await beaconClient.getPermissions();
        //     for (const p of permissions) {
        //         try {
        //             beaconInfo[p.senderId].website = p.website;
        //             beaconInfo[p.senderId].publicKey = p.publicKey;
        //             beaconInfo[p.senderId].accountIdentifier = p.accountIdentifier;
        //             beaconInfo[p.senderId].network = p.network.type;
        //             beaconInfo[p.senderId].scopes = p.scopes;
        //             beaconInfo[p.senderId].connectedAt = new Date(p.connectedAt);
        //         } catch (err) {
        //             //
        //         }
        //     }

        //     const peers = await beaconClient.getPeers();
        //     for (const peer of peers) {
        //         try {
        //             beaconInfo[peer.publicKey].relayServer = peer.relayServer;
        //         } catch (err) {
        //             //
        //         }
        //     }
        //     setBeaconState(beaconInfo);
        // };
        // readState();
    }, []);
    // TODO: below needs a cancel button next to the connect button and a deny button next to the grant button
    return (
        <ModalWrapper open={open}>
            {open ? (
                <ModalContainer>
                    <CloseIconWrapper onClick={() => onClose()} />
                    <ModalTitle>{t('components.Beacon.infoModal.title')}</ModalTitle>
                    <Container>
                        <div>{JSON.stringify(beaconState)}</div>
                    </Container>
                    {isLoading && <Loader />}
                    <Footer />
                </ModalContainer>
            ) : (
                <ModalContainer />
            )}
        </ModalWrapper>
    );
};

export default BeaconInfoModal;
