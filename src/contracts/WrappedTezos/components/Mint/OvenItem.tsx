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

    // display oven address, balance, delegate
    // modal to change delegate
    // button to withdraw

    return <></>;
}

export default OvenItem;
