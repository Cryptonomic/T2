import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { TezosWalletUtil } from 'conseiljs';

import CustomTextArea from '../../../components/CustomTextArea';
import TextField from '../../../components/TextField';
import InputAddress from '../../../components/InputAddress';
import { RootState } from '../../../types/store';
import { publicKeyThunk } from '../thunks';

import { Container, MainContainer, ButtonContainer, InvokeButton, Result, WarningIcon } from './style';

const Verify = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const isLoading = useSelector((rootState: RootState) => rootState.app.isLoading);
    const [message, setMessage] = useState('');
    const [signature, setSignature] = useState('');
    const [address, setAddress] = useState('');
    const [isAddressIssue, setIsAddressIssue] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState(false);

    const isDisabled = isLoading || !message || !signature || !address || isAddressIssue;

    async function onVerify() {
        let publicKey;

        try {
            publicKey = await dispatch(publicKeyThunk(address));
        } catch (e) {
            setResult(e.message);
            setError(true);
            return;
        }

        try {
            const isVerified = await TezosWalletUtil.checkSignature(signature, message, publicKey);
            if (!isVerified) {
                throw Error();
            }
            setResult(t('general.verbs.match'));
            setError(false);
        } catch {
            setResult(t('general.verbs.no_match'));
            setError(true);
        }
    }

    return (
        <Container>
            <MainContainer>
                <CustomTextArea label={t('general.nouns.message')} onChange={val => setMessage(val)} />
                <TextField label={t('general.nouns.signature')} onChange={val => setSignature(val)} />

                <InputAddress
                    label={t('general.nouns.signer_address')}
                    operationType="send_babylon"
                    tooltip={false}
                    onChange={val => setAddress(val)}
                    onIssue={val => setIsAddressIssue(val)}
                />
            </MainContainer>
            <ButtonContainer>
                {error && <WarningIcon />}
                {result && <Result>{result}</Result>}
                <InvokeButton buttonTheme="primary" disabled={isDisabled} onClick={onVerify}>
                    {t('general.verbs.verify')}
                </InvokeButton>
            </ButtonContainer>
        </Container>
    );
};

export default Verify;
