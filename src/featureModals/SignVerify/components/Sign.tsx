import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';

import TextField from '../../../components/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import CustomTextArea from '../../../components/CustomTextArea';
import CopyButton from '../../../components/CopyButton';
import { getSelectedKeyStore } from '../../../utils/general';
import { findIdentity } from '../../../utils/identity';
import { RootState, ModalState } from '../../../types/store';
import { getMainPath } from '../../../utils/settings';

import { publicKeyThunk } from '../thunks';

import {
    Container,
    MainContainer,
    ButtonContainer,
    ResultContainer,
    InvokeButton,
    Result,
    InfoContainer,
    MessageContainer,
    InfoIcon,
    WarningIcon,
    Footer,
} from '../../style';

const Sign = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { isLoading, selectedParentHash, isLedger, signer } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
    const { identities } = useSelector((rootState: RootState) => rootState.wallet, shallowEqual);
    const { values, activeTab } = useSelector<RootState, ModalState>((state) => state.modal, shallowEqual);
    const { settings } = useSelector((rootState: RootState) => rootState, shallowEqual);
    const [message, setMessage] = useState('');
    const [result, setResult] = useState('');
    const [error, setError] = useState(false);
    const [key, setKey] = useState('');
    const isDisabled = isLoading || !message;
    const [keyRevealed, setKeyRevealed] = useState(true);
    const { selectedPath, pathsList } = settings;
    const derivationPath = isLedger ? getMainPath(pathsList, selectedPath) : '';

    const onSign = async () => {
        const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger, derivationPath);

        try {
            const publicKey: any = await dispatch(publicKeyThunk(keyStore.publicKeyHash));
            setKeyRevealed(publicKey === keyStore.publicKey);
        } catch (e) {
            setKeyRevealed(false);
        }

        if (signer == null) {
            setError(true);
            setResult('No signing mechanism available');
            return;
        }

        const signature = await signer.signText(message);

        setError(false);
        setResult(signature);
    };

    useEffect(() => {
        const identity = findIdentity(identities, selectedParentHash);
        const { publicKey } = identity;
        setKey(publicKey);

        const req = values[activeTab];
        if (req && req.d) {
            setMessage(req.d);
        }
    }, []);

    return (
        <Container>
            <MessageContainer>
                <InfoIcon color="info" iconName="info" />
                {t('components.signVerifyModal.sign_guidance')}
            </MessageContainer>
            <MainContainer>
                <CustomTextArea label={t('general.nouns.message')} onChange={(val) => setMessage(val)} defaultValue={message} />
            </MainContainer>
            <ResultContainer id="signature">
                {error && <WarningIcon />}
                {error && result && <Result isError={error}>{result}</Result>}
                {!error && result && (
                    <TextField
                        data-spectron="signature-value"
                        id="signatureValue"
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
            <Footer>
                <ButtonContainer>
                    {!keyRevealed && (
                        <InfoContainer>
                            The account is not revealed, copy public key? <CopyButton text={key} title="" color="accent" />
                        </InfoContainer>
                    )}
                    <InvokeButton data-spectron="sign-button" id="signButton" buttonTheme="primary" disabled={isDisabled} onClick={onSign}>
                        {t('general.verbs.sign')}
                    </InvokeButton>
                </ButtonContainer>
            </Footer>
        </Container>
    );
};

export default Sign;
