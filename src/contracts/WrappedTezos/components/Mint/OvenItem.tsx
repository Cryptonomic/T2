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
        </div>
    );
}

export default OvenItem;
