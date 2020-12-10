import React, { useState } from 'react';

import { Oven } from '../../../../types/general';

import OvenItem from './OvenItem';

// import { Container } from '../style';
import { useSelector, useDispatch } from 'react-redux';
import { setModalOpen, clearModal } from '../../../../reduxContent/modal/actions';
import { RootState } from '../../../../types/store';
import SetDelegateModal from './SetDelegateModal';
import styled from 'styled-components';

export const Container = styled.section`
    height: 100%;
    width: 100%;
    padding-top: 20px;
`;

type OvenListProps = {
    ovens: Oven[];
};

const SET_DELEGATE_MODAL_IDENTIFIER = 'set_delegate_modal';

const OvenList = (props: OvenListProps) => {
    const { ovens } = props;

    // The oven being operated on.
    // TODO(keefertaylor): This should be typed as string or undefined. Not sure how to make that happen.
    const [activeOven, setActiveOven] = useState('');

    const dispatch = useDispatch();

    const setIsModalOpen = (open, active) => {
        dispatch(setModalOpen(open, active));
        if (!open) {
            dispatch(clearModal());
        }
    };

    const openSetDelegateModal = (ovenAddress: string) => {
        setActiveOven(ovenAddress);
        dispatch(setModalOpen(true, SET_DELEGATE_MODAL_IDENTIFIER));
    };
    // TODO(keefertaylor): Add function to open a deposit modal.
    // TODO(keefertaylor): Add function to open a withdraw modal.

    const activeModal = useSelector<RootState, string>((state) => state.modal.activeModal);
    const isModalOpen = useSelector<RootState, boolean>((state) => state.modal.open);

    const isSetDelegateModalOpen = isModalOpen && activeModal === SET_DELEGATE_MODAL_IDENTIFIER;

    const ovenItems = ovens.map((oven: Oven) => {
        // TODO(keefertaylor): add callbacks for deposit and withdraw to OvenItem
        return (
            <OvenItem key={oven.ovenAddress} address={oven.ovenAddress} delegate={oven.baker} balance={oven.ovenBalance} setDelegate={openSetDelegateModal} />
        );
    });

    return (
        <Container>
            {isSetDelegateModalOpen && (
                <SetDelegateModal
                    open={isSetDelegateModalOpen}
                    onClose={() => setIsModalOpen(false, SET_DELEGATE_MODAL_IDENTIFIER)}
                    // TODO(keefertaylor): Remove these props
                    managerBalance={0}
                />
            )}
            {ovenItems}
        </Container>
    );
};

export default OvenList;
