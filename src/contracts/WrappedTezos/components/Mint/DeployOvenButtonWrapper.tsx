import React from 'react';
import { Container } from '../style';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { setModalOpen, clearModal } from '../../../../reduxContent/modal/actions';
import { RootState } from '../../../../types/store';
import DeployOvenModal from './DeployOvenModal';

import { AddCircleWrapper } from './style';

const ADD_OVEN_MODAL_IDENTIFIER = 'add_oven';

/** Renders a wrapper around a component that includes a "Deploy Oven" button */
const DeployOvenButtonWrapper = (props) => {
    const { children } = props;

    const dispatch = useDispatch();

    function setIsModalOpen(open, active) {
        dispatch(setModalOpen(open, active));
        if (!open) {
            dispatch(clearModal());
        }
    }

    const activeModal = useSelector<RootState, string>((state) => state.modal.activeModal);
    const isModalOpen = useSelector<RootState, boolean>((state) => state.modal.open);

    const isAddOvenModalOpen = isModalOpen && activeModal === ADD_OVEN_MODAL_IDENTIFIER;

    return (
        <Container>
            {isAddOvenModalOpen && (
                <DeployOvenModal open={isAddOvenModalOpen} onClose={() => setIsModalOpen(false, ADD_OVEN_MODAL_IDENTIFIER)} managerBalance={100000000000} />
            )}

            <AddCircleWrapper active={1} onClick={() => dispatch(setModalOpen(true, ADD_OVEN_MODAL_IDENTIFIER))} />
            {children}
        </Container>
    );
};

export default DeployOvenButtonWrapper;
