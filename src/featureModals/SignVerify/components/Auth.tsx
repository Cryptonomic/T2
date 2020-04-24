import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { TezosWalletUtil } from 'conseiljs';

import CustomTextArea from '../../../components/CustomTextArea';
import CopyButton from '../../../components/CopyButton';
import { getSelectedKeyStore } from '../../../utils/general';
import { RootState, ModalState } from '../../../types/store';
import { publicKeyThunk } from '../thunks';

import { Container, MainContainer, ButtonContainer, ResultContainer, InvokeButton, Result, WarningIcon } from './style';

const Auth = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { isLoading, selectedParentHash, isLedger } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
    const { identities } = useSelector((rootState: RootState) => rootState.wallet, shallowEqual);
    const { tabsValues, activeTab } = useSelector<RootState, ModalState>(state => state.modal, shallowEqual);
    const [message, setMessage] = useState('');
    const [result, setResult] = useState('');
    const [error, setError] = useState(false);
    const isDisabled = isLoading || !message;

    const onAuth = async () => {
        // TODO: onAuth
    };

    useEffect(() => {
        const tab = tabsValues.find(({ type }) => type === activeTab);
        // TODO: expand tab values from url
        if (tab) {
            setMessage(tab.message);
        }
    }, []);

    return (
        <Container>
            <MainContainer>
                <CustomTextArea label={t('general.nouns.message')} onChange={val => setMessage(val)} defaultValue={message} />
            </MainContainer>
            <ResultContainer>
                {error && result && <WarningIcon />}
                <Result error={error}>{result}</Result>
                {!error && result && <CopyButton text={result} title="" color="accent" />}
            </ResultContainer>
            <ButtonContainer>
                <InvokeButton buttonTheme="primary" disabled={isDisabled} onClick={onAuth}>
                    {t('general.verbs.authenticate')}
                </InvokeButton>
            </ButtonContainer>
        </Container>
    );
};

export default Auth;
