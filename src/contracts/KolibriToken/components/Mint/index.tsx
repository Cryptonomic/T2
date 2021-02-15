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

import { AppState, RootState } from '../../../../types/store';

function Mint() {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [isDeployOvenModalOpen, setDeployOvenModalOpen] = useState(false);

    const { isLoading, isLedger, selectedParentHash } = useSelector<RootState, AppState>((state: RootState) => state.app, shallowEqual);

    // const {  } = props;

    useEffect(() => {
        // call thunks to list ovens
    }, []);

    // <AddCircleWrapper active={1} onClick={() => dispatch(setModalOpen(true, 'delegate_contract'))} />

    return <></>;
}

export default Mint;
