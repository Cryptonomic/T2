import React from 'react';
import { Container } from '../style';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { setModalOpen, clearModal } from '../../../../reduxContent/modal/actions';
import { RootState } from '../../../../types/store';
import DeployOvenModal from './DeployOvenModal';
import styled from 'styled-components';

import { AddCircleWrapper } from './style';

const BoldSpan = styled.span`
    font-weight: 500;
`;

export const AddOvenContainer = styled.div`
    display: flex;
    align-items: center;
    color: ${({ theme: { colors } }) => colors.primary};
`;

const MainContainer = styled.div`
    padding: 30px 76px 56px 76px;
`;

export const SectionContainer = styled.div``;

const ADD_OVEN_MODAL_IDENTIFIER = 'add_oven';

/** Renders a wrapper around a component that includes a "Deploy Vault" button */
const DeployOvenButtonWrapper = (props) => {
    const { children } = props;

    // T2 only supports one identity. This *WILL* break in the future if multiple identities are
    // supported.
    const identities = useSelector((state: RootState) => state.wallet.identities, shallowEqual);
    const activeIdentity = identities[0];
    const balance = activeIdentity.balance;

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
                <DeployOvenModal open={isAddOvenModalOpen} onClose={() => setIsModalOpen(false, ADD_OVEN_MODAL_IDENTIFIER)} managerBalance={balance} />
            )}

            <AddOvenContainer>
                <AddCircleWrapper active={1} onClick={() => dispatch(setModalOpen(true, ADD_OVEN_MODAL_IDENTIFIER))} />
                <BoldSpan onClick={() => dispatch(setModalOpen(true, ADD_OVEN_MODAL_IDENTIFIER))}>Deploy New Vault</BoldSpan>
            </AddOvenContainer>
            {children}
        </Container>
    );
};

export default DeployOvenButtonWrapper;
