import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { KeyStoreUtils } from 'conseiljs-softsigner';

import CustomTextArea from '../../../components/CustomTextArea';
import TextField from '../../../components/TextField';
import InputAddress from '../../../components/InputAddress';
import { RootState } from '../../../types/store';
import { getSelectedKeyStore } from '../../../utils/general';
import { publicKeyThunk } from '../thunks';

import { Container, MainContainer, ButtonContainer, InvokeButton, Result, WarningIcon, MessageContainer, InfoIcon, SuccessIcon, Footer } from '../../style';

const Verify = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { isLoading, selectedParentHash, isLedger, signer } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
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
            } else if (address.startsWith('edpk') && address.length === 54) {
                publicKey = address;
            } else {
                publicKey = await dispatch(publicKeyThunk(address));
            }
        } catch (e) {
            setResult(e.message);
            setError(true);
            return;
        }

        try {
            const isVerified = await KeyStoreUtils.checkTextSignature(signature, message, publicKey);

            if (!isVerified) {
                setResult(t('components.signVerifyModal.no_match'));
                setError(true);
            } else {
                setResult(t('components.signVerifyModal.match'));
                setError(false);
            }
        } catch (e) {
            setResult(`Signature verification failure: ${e}`);
            setError(true);
        }
    }

    return (
        <Container>
            <MessageContainer>
                <InfoIcon color="info" iconName="info" />
                {t('components.signVerifyModal.verify_guidance')}
            </MessageContainer>
            <MainContainer>
                <CustomTextArea label={t('general.nouns.message')} onChange={(val) => setMessage(val)} />
                <TextField label={t('general.nouns.signature')} onChange={(val) => setSignature(val)} />

                <InputAddress
                    label={t('components.signVerifyModal.enter_address_key')}
                    operationType="tz1"
                    tooltip={false}
                    onChange={(val) => setAddress(val)}
                    onIssue={(val) => setIsAddressIssue(val)}
                />
            </MainContainer>
            <Footer>
                <ButtonContainer>
                    {error && <WarningIcon />}
                    {!error && result && <SuccessIcon color="check" iconName="checkmark2" />}
                    {result && <Result isError={error}>{result}</Result>}
                    <InvokeButton buttonTheme="primary" disabled={isDisabled} onClick={onVerify}>
                        {t('general.verbs.verify')}
                    </InvokeButton>
                </ButtonContainer>
            </Footer>
        </Container>
    );
};

export default Verify;
