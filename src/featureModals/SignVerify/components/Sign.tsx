import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { TezosWalletUtil } from 'conseiljs';

import CustomTextArea from '../../../components/CustomTextArea';
import CopyButton from '../../../components/CopyButton';
import { getSelectedKeyStore } from '../../../utils/general';
import { RootState } from '../../../types/store';
import { publicKeyThunk } from '../thunks';

import { Container, MainContainer, ButtonContainer, ResultContainer, InvokeButton, Result, WarningIcon } from './style';

const Sign = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { isLoading, selectedParentHash, isLedger } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
    const { identities } = useSelector((rootState: RootState) => rootState.wallet, shallowEqual);
    const defaultMessage = useSelector<RootState, string>((state: RootState) => state.modal.defaultMessage);
    const [message, setMessage] = useState(defaultMessage);
    const [result, setResult] = useState('');
    const [error, setError] = useState(false);
    const isDisabled = isLoading || !message;

    const onSign = async () => {
        const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger);
        try {
            const publicKey: unknown = await dispatch(publicKeyThunk(keyStore.publicKey));
            if (publicKey !== keyStore.publicKey) {
                throw Error(t('general.verbs.no_match'));
            }
        } catch (e) {
            setError(true);
            setResult(e.message);
            return;
        }

        const op = await TezosWalletUtil.signText(keyStore, message);
        setError(false);
        setResult(op);
    };

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
                <InvokeButton buttonTheme="primary" disabled={isDisabled} onClick={onSign}>
                    {t('general.verbs.sign')}
                </InvokeButton>
            </ButtonContainer>
        </Container>
    );
};

export default Sign;
