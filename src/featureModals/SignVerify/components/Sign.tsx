import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { TezosWalletUtil, TezosLedgerWallet } from 'conseiljs';

import TextField from '../../../components/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import CustomTextArea from '../../../components/CustomTextArea';
import CopyButton from '../../../components/CopyButton';
import { getSelectedKeyStore } from '../../../utils/general';
import { findIdentity } from '../../../utils/identity';
import { RootState } from '../../../types/store';
import { publicKeyThunk } from '../thunks';

import { Container, MainContainer, ButtonContainer, ResultContainer, InvokeButton, Result, InfoContainer, MessageContainer, InfoIcon } from './style';

const Sign = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { isLoading, selectedParentHash, isLedger } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
    const { identities } = useSelector((rootState: RootState) => rootState.wallet, shallowEqual);
    const [message, setMessage] = useState('');
    const [result, setResult] = useState('');
    const [error, setError] = useState(false);
    const [key, setKey] = useState('');
    const isDisabled = isLoading || !message;
    const [keyRevealed, setKeyRevealed] = useState(true);

    const onSign = async () => {
        const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger);

        try {
            const publicKey: any = await dispatch(publicKeyThunk(keyStore.publicKeyHash));
            setKeyRevealed(publicKey === keyStore.publicKey);
        } catch (e) {
            setKeyRevealed(false);
        }

        let signature: string;
        if (isLedger) {
            signature = await TezosLedgerWallet.signText(keyStore.derivationPath || '', message);
        } else {
            signature = await TezosWalletUtil.signText(keyStore, message);
        }

        setError(false);
        setResult(signature);
    };

    useEffect(() => {
        const identity = findIdentity(identities, selectedParentHash);
        const { publicKey } = identity;
        setKey(publicKey);
    }, []);

    return (
        <Container>
            <MessageContainer>
                <InfoIcon color="info" iconName="info" /> Signing a message allows others to verify your ownership of this account using only this message,
                signature and your address/public key.
            </MessageContainer>
            <MainContainer>
                <CustomTextArea label={t('general.nouns.message')} onChange={val => setMessage(val)} />
            </MainContainer>
            <ResultContainer>
                {error && result && <Result>{result}</Result>}
                {!error && result && (
                    <TextField
                        label={t('general.nouns.signature')}
                        value={result}
                        readOnly={true}
                        endAdornment={
                            <InputAdornment position="end">
                                <CopyButton text={result} title="" color="accent" />
                            </InputAdornment>
                        }
                    />
                )}
            </ResultContainer>
            <ButtonContainer>
                {!keyRevealed && (
                    <InfoContainer>
                        The account is not revealed, copy public key? <CopyButton text={key} title="" color="accent" />
                    </InfoContainer>
                )}
                <InvokeButton buttonTheme="primary" disabled={isDisabled} onClick={onSign}>
                    {t('general.verbs.sign')}
                </InvokeButton>
            </ButtonContainer>
        </Container>
    );
};

export default Sign;
