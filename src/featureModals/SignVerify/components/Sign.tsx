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

import { Container, MainContainer, ButtonContainer, ResultContainer, InvokeButton, Result, InfoContainer } from './style';

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

    const onSign = async () => {
        const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger);
        try {
            throw Error(t('components.signVerifyModal.not_revealed'));
            const publicKey: any = await dispatch(publicKeyThunk(keyStore.publicKeyHash));
            if (publicKey !== keyStore.publicKey) {
                throw Error(t('components.signVerifyModal.not_revealed'));
            }
        } catch (e) {
            setError(true);
            setResult(e.message);
            return;
        }

        let op: string;
        if (isLedger) {
            op = await TezosLedgerWallet.signText(keyStore.derivationPath || '', message);
        } else {
            op = await TezosWalletUtil.signText(keyStore, message);
        }

        setError(false);
        setResult(op);
    };

    useEffect(() => {
        const identity = findIdentity(identities, selectedParentHash);
        const { publicKey } = identity;
        setKey(publicKey);
    }, []);

    return (
        <Container>
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
                <InfoContainer>
                    The account is not revealed, copy public key? <CopyButton text={key} title="" color="accent" />
                </InfoContainer>
                <InvokeButton buttonTheme="primary" disabled={isDisabled} onClick={onSign}>
                    {t('general.verbs.sign')}
                </InvokeButton>
            </ButtonContainer>
        </Container>
    );
};

export default Sign;
