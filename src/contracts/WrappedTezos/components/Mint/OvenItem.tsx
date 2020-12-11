import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';

// TODO(keefertaylor): Lots of unused imports and vars, do a final pass over this codebase to clean up.
import {
    Container,
    AmountContainer,
    FeeContainer,
    PasswordButtonContainer,
    InvokeButton,
    RowContainer,
    MessageContainer,
    InfoIcon,
} from '../../../components/style';

interface Props {
    address: string;
    delegate: string;
    balance: number;

    // Functions to call to open action modals.
    deposit: (ovenAddress: string) => void;
    withdraw: (ovenAddress: string) => void;
    setDelegate: (ovenAddress: string) => void;
}

function OvenItem(props: Props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const { address, delegate, balance } = props;

    return (
        <div>
            Address: {address}
            <br />
            Delegate: {delegate}
            <br />
            Balance: {balance}
            <br />
            <InvokeButton buttonTheme="primary" onClick={() => props.deposit(address)}>
                {/* TODO(keefertaylor): Use translations here */}
                Deposit
            </InvokeButton>
            <InvokeButton buttonTheme="primary" onClick={() => props.withdraw(address)}>
                {/* TODO(keefertaylor): Use translations here */}
                Withdraw
            </InvokeButton>
            <InvokeButton buttonTheme="primary" onClick={() => props.setDelegate(address)}>
                {/* TODO(keefertaylor): Use translations here */}
                Set Delegate
            </InvokeButton>
        </div>
    );
}

export default OvenItem;
