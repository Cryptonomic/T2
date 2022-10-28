import React, { useState } from 'react';

import { Vault } from '../../../../types/general';

import OvenItem from './OvenItem';

import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { setModalOpen, clearModal } from '../../../../reduxContent/modal/actions';
import { RootState } from '../../../../types/store';
import SetDelegateModal from './SetDelegateModal';
import DepositModal from './DepositModal';
import WithdrawModal from './WithdrawModal';
import styled from 'styled-components';
import { getTokenSelector } from '../../../duck/selectors';

export const Container = styled.section`
    height: 100%;
    width: 100%;
    padding-top: 20px;
`;

type OvenListProps = {
    ovens: Vault[];
    managerBalance: number;
};

const DEPOSIT_MODAL_IDENTIFIER = 'deposit_modal';
const WITHDRAW_MODAL_IDENTIFIER = 'withdraw_modal';
const SET_DELEGATE_MODAL_IDENTIFIER = 'set_delegate_modal';

const OvenList = (props: OvenListProps) => {
    const { ovens } = props;

    // The oven being operated on.
    const [activeOven, setActiveOven] = useState('');

    const identities = useSelector((state: RootState) => state.wallet.identities, shallowEqual);

    const selectedToken = useSelector(getTokenSelector);

    // TODO: T2 only supports one identity. This *WILL* break in the future if multiple identities are supported.
    const activeIdentity = identities[0];
    const balance = activeIdentity.balance;

    const dispatch = useDispatch();

    const setIsModalOpen = (open, active) => {
        dispatch(setModalOpen(open, active));
        if (!open) {
            dispatch(clearModal());
        }
    };

    const ovenForAddress = (ovenAddress, vaultList): Vault | undefined => {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < vaultList.length; i++) {
            const oven = vaultList[i];
            if (oven.ovenAddress === ovenAddress) {
                return oven;
            }
        }

        return undefined;
    };

    const openModal = (ovenAddress: string, modalIdentifier: string) => {
        setActiveOven(ovenAddress);
        dispatch(setModalOpen(true, modalIdentifier));
    };
    const openDepositModal = (ovenAddress: string) => {
        openModal(ovenAddress, DEPOSIT_MODAL_IDENTIFIER);
    };
    const openWithdrawModal = (ovenAddress: string) => {
        openModal(ovenAddress, WITHDRAW_MODAL_IDENTIFIER);
    };
    const openSetDelegateModal = (ovenAddress: string) => {
        openModal(ovenAddress, SET_DELEGATE_MODAL_IDENTIFIER);
    };

    const activeModal = useSelector<RootState, string>((state) => state.modal.activeModal);
    const isModalOpen = useSelector<RootState, boolean>((state) => state.modal.open);

    const isSetDelegateModalOpen = isModalOpen && activeModal === SET_DELEGATE_MODAL_IDENTIFIER;
    const isDepositModalOpen = isModalOpen && activeModal === DEPOSIT_MODAL_IDENTIFIER;
    const isWithdrawModalOpen = isModalOpen && activeModal === WITHDRAW_MODAL_IDENTIFIER;

    const ovenItems = ovens.map((oven: Vault) => {
        return (
            <OvenItem
                key={oven.ovenAddress}
                address={oven.ovenAddress}
                delegate={oven.baker}
                balance={oven.ovenBalance}
                deposit={openDepositModal}
                withdraw={openWithdrawModal}
                setDelegate={openSetDelegateModal}
            />
        );
    });

    return (
        <Container>
            {isSetDelegateModalOpen && (
                <SetDelegateModal
                    open={isSetDelegateModalOpen}
                    onClose={() => setIsModalOpen(false, SET_DELEGATE_MODAL_IDENTIFIER)}
                    managerBalance={balance}
                    ovenAddress={activeOven}
                />
            )}
            {isDepositModalOpen && (
                <DepositModal
                    open={isDepositModalOpen}
                    onClose={() => setIsModalOpen(false, DEPOSIT_MODAL_IDENTIFIER)}
                    managerBalance={balance}
                    ovenAddress={activeOven}
                />
            )}
            {isWithdrawModalOpen && (
                <WithdrawModal
                    open={isWithdrawModalOpen}
                    onClose={() => setIsModalOpen(false, WITHDRAW_MODAL_IDENTIFIER)}
                    wrappedTezBalance={selectedToken.balance}
                    vaultBalance={(ovenForAddress(activeOven, ovens) as Vault).ovenBalance}
                    managerBalance={balance}
                    ovenAddress={activeOven}
                />
            )}
            {ovenItems}
        </Container>
    );
};

export default OvenList;
