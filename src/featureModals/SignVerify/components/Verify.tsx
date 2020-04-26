import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { TezosWalletUtil } from 'conseiljs';

import CustomTextArea from '../../../components/CustomTextArea';
import TextField from '../../../components/TextField';
import InputAddress from '../../../components/InputAddress';
import { RootState } from '../../../types/store';
import { getSelectedKeyStore } from '../../../utils/general';
import { publicKeyThunk } from '../thunks';

import { Container, MainContainer, ButtonContainer, InvokeButton, Result, WarningIcon } from './style';

const Verify = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { isLoading, selectedParentHash, isLedger } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
    const { identities } = useSelector((rootState: RootState) => rootState.wallet, shallowEqual);
    const [message, setMessage] = useState('');
    const [signature, setSignature] = useState('');
    const [address, setAddress] = useState('');
    const [isAddressIssue, setIsAddressIssue] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState(false);

    const isDisabled = isLoading || !message || !signature || !address || isAddressIssue;

    async function onVerify() {
        let publicKey;

        const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger);

        try {
            if (keyStore.publicKeyHash === address) {
                publicKey = keyStore.publicKey;
            } else {
                publicKey = await dispatch(publicKeyThunk(address));
            }
        } catch (e) {
            setResult(e.message);
            setError(true);
            return;
        }

        try {
            const isVerified = await TezosWalletUtil.checkSignature(signature, message, publicKey);

            if (!isVerified) {
                setResult(t('general.verbs.no_match'));
                setError(true);
            } else {
                setResult(t('general.verbs.match'));
                setError(false);
            }
        } catch (e) {
            setResult(`Signature verification failure: ${e}`);
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
                    operationType="tz1"
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
