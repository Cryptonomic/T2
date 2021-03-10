import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { beaconClient } from './BeaconMessageRouter';
import { setBeaconLoading } from '../../reduxContent/app/actions';
import { createMessageAction } from '../../reduxContent/message/actions';

import beaconIntegration from '../../../resources/imgs/beacon-integration.svg';
import Loader from '../../components/Loader';
import { RootState } from '../../types/store';
import {
    AddressInfoLink,
    ModalWrapper,
    ModalContainer,
    CloseIconWrapper,
    ModalTitle,
    BeaconNotConnected,
    BeaconConnected,
    BeaconInfoContainer,
} from '../style';

import { openLink } from '../../utils/general';

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

const BeaconInfoModal = ({ open, onClose }: Props) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const selectedAccountHash = useSelector((state: RootState) => state.app.selectedAccountHash);
    const { beaconLoading } = useSelector((rootState: RootState) => rootState.app, shallowEqual);

    const [connected, setConnected] = useState(false);
    const [beaconState, setBeaconState] = useState<Record<string, string>[]>([]);

    useEffect(() => {
        dispatch(setBeaconLoading(true));
        const beaconInfo = {};
        const readState = async () => {
            try {
                const apps = await beaconClient.getAppMetadataList();
                for (const app of apps) {
                    beaconInfo[app.senderId] = { name: app.name };
                }

                const permissions = await beaconClient.getPermissions();
                const isValid = permissions.filter((p) => p.address === selectedAccountHash).length;

                if (!isValid) {
                    return;
                }

                for (const p of permissions) {
                    beaconInfo[p.senderId].website = p.website;
                    beaconInfo[p.senderId].publicKey = p.publicKey;
                    beaconInfo[p.senderId].accountIdentifier = p.accountIdentifier;
                    beaconInfo[p.senderId].network = p.network.type;
                    beaconInfo[p.senderId].scopes = p.scopes.map((s) => t(`components.Beacon.info.permissions.${s}`)).join(', ');
                    beaconInfo[p.senderId].connectedAt = new Date(p.connectedAt).toLocaleDateString();
                    // beaconInfo[p.senderId].icon = beaconDexter; // TODO: add icon based on id
                }

                const beaconAppKeys = Object.keys(beaconInfo);
                for (const k of beaconAppKeys) {
                    if (!beaconInfo[k].scopes) {
                        // await beaconClient.removeAppMetadata(k);
                        // delete beaconInfo[k]
                    }
                }

                const list: Record<string, string>[] = Object.values(beaconInfo);

                if (list.length) {
                    setConnected(true);
                    setBeaconState(list);
                }
            } catch (e) {
                console.log('BeaconInfoError', e);
                dispatch(setBeaconLoading());
                dispatch(createMessageAction('Failed to fetch Beacon connection info', true));
            }
        };
        readState();
        dispatch(setBeaconLoading());
    }, []);

    return (
        <ModalWrapper open={open}>
            {open ? (
                <ModalContainer>
                    <CloseIconWrapper onClick={() => onClose()} />
                    <ModalTitle>{t('components.Beacon.info.title')}</ModalTitle>
                    <BeaconInfoContainer>
                        <h4 className="title">dApps connected using Beacon</h4>
                        {!connected && (
                            <BeaconNotConnected>
                                <p className="message">You haven’t connected to any dApps yet.</p>
                                <p className="info">
                                    Beacon allows you interact with web-based dApps using your Tezos account. Once you start making connections with dApps that
                                    support Beacon, they will show up here!{' '}
                                    <AddressInfoLink href="#" onClick={() => openLink('https://www.walletbeacon.io/')}>
                                        Learn more
                                    </AddressInfoLink>
                                </p>
                                <img className="img" src={beaconIntegration} />
                            </BeaconNotConnected>
                        )}
                        {connected && (
                            <div className="items">
                                {beaconState.map((i: Record<string, string>, index: number) => (
                                    <BeaconConnected key={index}>
                                        {/*<div className="img"> <img src={i.icon} /> </div>*/}
                                        <div className="list">
                                            <div className="name">
                                                {i.name}
                                                {i.network && <span> on {i.network}</span>}
                                            </div>
                                            {i.website && <div className="item">{i.website}</div>}
                                            {i.connectedAt && <div className="item">Connected on {i.connectedAt}</div>}
                                            {i.scopes && <div className="item">Permissions: {i.scopes}</div>}
                                            {!i.scopes && <div className="item">Missing Beacon permission record</div>}
                                            {/*<div> removeAppMetadata(senderId: string): Promise<void>;*/}
                                        </div>
                                    </BeaconConnected>
                                ))}
                            </div>
                        )}
                    </BeaconInfoContainer>
                    {beaconLoading && <Loader />}
                </ModalContainer>
            ) : (
                <ModalContainer />
            )}
        </ModalWrapper>
    );
};

export default BeaconInfoModal;
