import { useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { WalletClient, BeaconMessageType, BeaconRequestOutputMessage, ConnectionContext } from '@airgap/beacon-sdk';
import { BeaconErrorType } from '@airgap/beacon-sdk';
import { setBeaconMessageAction, setBeaconLoading, setBeaconClientAction } from '../../reduxContent/app/actions';
import { setModalOpen, setModalValue } from '../../reduxContent/modal/actions';
import { createMessageAction } from '../../reduxContent/message/actions';

import { getMainNode } from '../../utils/settings';

import { RootState } from '../../types/store';

export const beaconClient = new WalletClient({ name: 'Beacon Wallet Client' });

export const BeaconMessageRouter = () => {
    const dispatch = useDispatch();
    const { settings } = useSelector((rootState: RootState) => rootState, shallowEqual);
    const modalValues = useSelector<RootState, any>((state) => state.modal.values);
    const beaconMessage = useSelector((state: RootState) => state.app.beaconMessage);
    const beaconConnection = useSelector((state: RootState) => state.app.beaconConnection);
    const selectedParentHash = useSelector((state: RootState) => state.app.selectedParentHash);
    const beaconClientLoaded = useSelector((state: RootState) => state.app.beaconClient);
    const isError = useSelector((state: RootState) => state.message.isError);
    const beaconLoading = useSelector((state: RootState) => state.app.beaconLoading);

    const connectedBlockchainNode = getMainNode(settings.nodesList, settings.selectedNode);

    const onBeaconMessage = (message: BeaconRequestOutputMessage, connection: ConnectionContext) => {
        if (message.type === BeaconMessageType.PermissionRequest) {
            if (connectedBlockchainNode.network !== message.network.type) {
                dispatch(createMessageAction('Beacon network mismatch', true));
                return;
            }

            /*if (!Object.keys(modalValues).length || !Object.keys(modalValues).includes('beaconRegistration')) {
                dispatch(createMessageAction('Received unexpected Beacon request', true));
                return;
            }*/

            /*if (connection.id !== modalValues.beaconRegistration.publicKey) {
                dispatch(createMessageAction('Beacon connection id did not match', true));
                return;
            }*/

            dispatch(setBeaconLoading());
            dispatch(setModalValue(message, 'beaconPermission'));
            dispatch(setModalOpen(false, 'beaconRegistration'));
            dispatch(setModalOpen(true, 'beaconPermission'));
        } else if (message.type === BeaconMessageType.OperationRequest) {
            if (message.sourceAddress !== selectedParentHash) {
                dispatch(createMessageAction('Beacon requestor address did not match', true));
                return;
            }

            if (connectedBlockchainNode.network !== message.network.type) {
                dispatch(createMessageAction(`Beacon unexpected network: ${message.network.type}`, true));
                beaconClient.respond({ id: message.id, type: BeaconMessageType.Error, errorType: BeaconErrorType.NETWORK_NOT_SUPPORTED });
                return;
            }

            if (!message.operationDetails.length) {
                dispatch(createMessageAction('Beacon invalid operation', true));
                return;
            }

            if (!message.operationDetails.filter((o) => o.kind === 'transaction' || o.kind === 'delegation' || o.kind === 'origination').length) {
                dispatch(createMessageAction(`Unsupported Beacon operation, ${message.operationDetails[0].kind}`, true));
                beaconClient.respond({ id: message.id, type: BeaconMessageType.Error, errorType: BeaconErrorType.UNKNOWN_ERROR });
                return;
            }

            dispatch(setModalValue(message, 'beaconAuthorize'));
            dispatch(setModalOpen(true, 'beaconAuthorize'));
        } else if (message.type === BeaconMessageType.SignPayloadRequest) {
            if (message.sourceAddress !== selectedParentHash) {
                dispatch(createMessageAction('Beacon requestor address did not match', true));
                return;
            }

            dispatch(setModalValue(message, 'beaconSignature'));
            dispatch(setModalOpen(true, 'beaconSignature'));
        } else {
            console.log(`unsupported beacon message, ${JSON.stringify(message)}`);
        }
    };

    useEffect(() => {
        if (!isError || !beaconLoading) {
            return;
        }

        dispatch(dispatch(setBeaconLoading()));
    }, [isError, beaconLoading]);

    useEffect(() => {
        if (!beaconMessage || !beaconConnection) {
            return;
        }
        onBeaconMessage(beaconMessage, beaconConnection);
    }, [beaconMessage, beaconConnection]);

    useEffect(() => {
        if (beaconClientLoaded) {
            return;
        }

        dispatch(setBeaconClientAction(true));

        const init = async () => {
            try {
                await beaconClient.init();
                await beaconClient.connect((message, connection) => dispatch(setBeaconMessageAction(message, connection)));
            } catch (e) {
                console.log('BeaconMessageRouter Error', e);
            }
        };
        init();
    }, []);

    return null;
};
