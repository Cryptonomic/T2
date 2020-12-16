import { useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { WalletClient, BeaconMessageType, BeaconRequestOutputMessage } from '@airgap/beacon-sdk';

import { setBeaconMessageAction, setBeaconLoading, setBeaconClientAction } from '../../reduxContent/app/actions';
import { setModalOpen, setModalValue } from '../../reduxContent/modal/actions';

import { getMainNode } from '../../utils/settings';

import { RootState, ModalState } from '../../types/store';

export const beaconClient = new WalletClient({ name: 'Beacon Wallet Client' });

export const BeaconConnect = () => {
    const dispatch = useDispatch();
    const { settings } = useSelector((rootState: RootState) => rootState, shallowEqual);
    const modalValues = useSelector<RootState, ModalState>((state) => state.modal.values);
    const beaconMessage = useSelector((state: RootState) => state.app.beaconMessage);
    const beaconClientLoaded = useSelector((state: RootState) => state.app.beaconClient);

    const connectedBlockchainNode = getMainNode(settings.nodesList, settings.selectedNode);

    const onBeaconMessage = (message: BeaconRequestOutputMessage) => {
        if (message.type === BeaconMessageType.PermissionRequest) {
            console.log('Beacon.PermissionRequest', message);
            if (connectedBlockchainNode.network !== message.network.type) {
                // TODO: error network mismatch
            }

            if (modalValues.beaconRegistration.publicKey !== message.appMetadata.senderId) {
                // TODO: error requestor key mismatch
            }

            dispatch(setBeaconLoading());
            dispatch(setModalValue(message, 'beaconPermission'));
            dispatch(setModalOpen(false, 'beaconRegistration'));
            dispatch(setModalOpen(true, 'beaconPermission'));
        }

        if (message.type === BeaconMessageType.OperationRequest) {
            console.log('Beacon.OperationRequest', message);

            if (connectedBlockchainNode.network !== message.network.type) {
                // TODO: error network mismatch
            }

            if (!message.operationDetails.length) {
                // TODO: error no transactions
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
