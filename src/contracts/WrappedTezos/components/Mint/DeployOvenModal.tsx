import React from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import { RootState } from '../../../../types/store';
import Modal from '../../../../components/CustomModal';
import { InvokeButton } from './style';
import { setIsLoadingAction } from '../../../../reduxContent/app/actions';

type DeployOvenModalProps = {
    // Whether the modal is open.
    open: boolean;

    // A handler that will close the modal.
    onClose: () => void;
};

/** A modal for depoying ovens. */
function DeployOvenModal(props: DeployOvenModalProps) {
    const dispatch = useDispatch();
    const { isLoading } = useSelector((rootState: RootState) => rootState.app, shallowEqual);

    const isDisabled = isLoading;

    const onCloseClick = () => {
        props.onClose();
    };

    const deployOven = () => {
        dispatch(setIsLoadingAction(true));

        // TODO(keefertaylor): Add a thunk to deploy an oven.

        dispatch(setIsLoadingAction(false));
        props.onClose();
    };

    return (
        <Modal title="Deploy Oven" open={props.open} onClose={onCloseClick}>
            <p>Please note: deploying a new oven incurs fees.</p>
            <InvokeButton buttonTheme="primary" disabled={isDisabled} onClick={() => deployOven()}>
                {/* TODO(keefertaylor): Use translations here */}
                Deploy Oven
            </InvokeButton>
        </Modal>
    );
}

export default DeployOvenModal;
