import { useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { WalletClient, BeaconMessageType, BeaconRequestOutputMessage } from '@airgap/beacon-sdk';

import { setBeaconMessageAction, setBeaconLoading, setBeaconClientAction } from '../../reduxContent/app/actions';
import { setModalOpen, setModalValue } from '../../reduxContent/modal/actions';
import { createMessageAction } from '../../reduxContent/message/actions';

import { getMainNode } from '../../utils/settings';

import { RootState } from '../../types/store';

export const beaconClient = new WalletClient({ name: 'Beacon Wallet Client' });

export const BeaconConnect = () => {
    const dispatch = useDispatch();
    const { settings } = useSelector((rootState: RootState) => rootState, shallowEqual);
    const modalValues = useSelector<RootState, any>((state) => state.modal.values);
    const beaconMessage = useSelector((state: RootState) => state.app.beaconMessage);
    const selectedAccountHash = useSelector((state: RootState) => state.app.selectedAccountHash);
    const beaconClientLoaded = useSelector((state: RootState) => state.app.beaconClient);

    const connectedBlockchainNode = getMainNode(settings.nodesList, settings.selectedNode);

    const onBeaconMessage = (message: BeaconRequestOutputMessage) => {
        if (message.type === BeaconMessageType.PermissionRequest) {
            console.log('Beacon.PermissionRequest', message);
            if (connectedBlockchainNode.network !== message.network.type) {
                dispatch(createMessageAction('Beacon: network not match', true));
                return;
            }

            if (modalValues.beaconRegistration.publicKey !== message.appMetadata.senderId) {
                dispatch(createMessageAction('Beacon: key not match', true));
                return;
            }

            dispatch(setBeaconLoading());
            dispatch(setModalValue(message, 'beaconPermission'));
            dispatch(setModalOpen(false, 'beaconRegistration'));
            dispatch(setModalOpen(true, 'beaconPermission'));
        }

        if (message.type === BeaconMessageType.OperationRequest) {
            console.log('Beacon.OperationRequest', message);

            if (message.sourceAddress !== selectedAccountHash) {
                dispatch(createMessageAction('Beacon: address not match', true));
                return;
            }

            if (connectedBlockchainNode.network !== message.network.type) {
                dispatch(createMessageAction('Beacon: network not match', true));
                return;
            }

            if (!message.operationDetails.length) {
                dispatch(createMessageAction('Beacon: key not match', true));
                return;
            }

            dispatch(setModalValue(message, 'beaconAuthorize'));
            dispatch(setModalOpen(true, 'beaconAuthorize'));
        }
    };

    useEffect(() => {
        if (!beaconMessage) {
            return;
        }
        onBeaconMessage(beaconMessage);
    }, [beaconMessage]);

    useEffect(() => {
        if (beaconClientLoaded) {
            return;
        }

        dispatch(setBeaconClientAction(true));

        const init = async () => {
            try {
                await beaconClient.init();
                await beaconClient.connect((message) => dispatch(setBeaconMessageAction(message)));
                console.log('BeaconConnect.Loaded');
            } catch (e) {
                console.log('BeaconConnectError', e);
            }
        };
        init();
    }, []);

    return null;
};
