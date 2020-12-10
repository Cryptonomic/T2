import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';

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

    // Function to call to set the delegate.
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
            {/* TODO(keefertaylor): Add buttons for deposit and withdraw */}
            <InvokeButton buttonTheme="primary" onClick={() => props.setDelegate(address)}>
                {/* TODO(keefertaylor): Use translations here */}
                Set Delegate
            </InvokeButton>
        </div>
    );
}

export default OvenItem;
