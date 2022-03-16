import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { TezosMessageUtils } from 'conseiljs';
import { SoftSigner } from 'conseiljs-softsigner';

import { createMessageAction } from '../../reduxContent/message/actions';
import { getSelectedKeyStore } from '../../utils/general';
import { getMainPath } from '../../utils/settings';
import CopyButton from '../../components/CopyButton';
import PasswordInput from '../../components/PasswordInput';
import { RootState } from '../../types/store';

import { CloseIconWrapper, ModalContainer, ModalTitle, ModalWrapper, KeyWrapper, KeyTitle, KeyAddress, Keys, SecretKeyMessage, InvokeButton, ButtonContainer } from '../style';

interface Props {
    open: boolean;
    onClose: () => void;
}

const KeyDetails = (props: Props) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { isLedger, selectedParentHash, signer } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
    const { identities } = useSelector((rootState: RootState) => rootState.wallet, shallowEqual);
    const { settings } = useSelector((rootState: RootState) => rootState, shallowEqual);
    const { open, onClose } = props;
    const { selectedPath, pathsList } = settings;
    const derivationPath = isLedger ? getMainPath(pathsList, selectedPath) : '';

    const [address, setAddress] = useState('');
    const [publicKey, setPublicKey] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [secretKeyVisible, setSecretKeyVisible] = useState(false);
    const [password, setPassword] = useState('');

    useEffect(() => {
        const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger, derivationPath);
        setAddress(keyStore.publicKeyHash);
        setPublicKey(keyStore.publicKey);
    }, []);

    const onShowSecretKey = async () => {
        try {
            const rawSecretKey = await (signer as SoftSigner).getKey(password);
            const stringSecretKey = TezosMessageUtils.readKeyWithHint(rawSecretKey, 'edsk');

            if (!stringSecretKey.startsWith('edsk')) {
                dispatch(createMessageAction('components.messageBar.messages.invalid_wallet_password', true));
            } else {
                setSecretKey(stringSecretKey);
                setSecretKeyVisible(true);
            }
        } catch {
            dispatch(createMessageAction('components.messageBar.messages.invalid_wallet_password', true));
        }
    };

    return (
        <ModalWrapper open={open}>
            {open ? (
                <ModalContainer>
                    <CloseIconWrapper onClick={() => onClose()} />
                    <ModalTitle>{t('components.keyDetailsModal.title')}</ModalTitle>
                    <Keys>
                        <KeyWrapper>
                            <KeyTitle>{t('components.keyDetailsModal.address')}</KeyTitle>
                            <KeyAddress>
                                {address}
                                <CopyButton text={address} title="" color="accent" />
                            </KeyAddress>
                        </KeyWrapper>
                        <KeyWrapper>
                            <KeyTitle>{t('components.keyDetailsModal.publicKey')}</KeyTitle>
                            <KeyAddress>
                                {publicKey}
                                <CopyButton text={'Tezos Public Key: ' + publicKey} title="" color="accent" />
                            </KeyAddress>
                        </KeyWrapper>
                        {!isLedger && (
                            <KeyWrapper>
                                <KeyTitle>{t('components.keyDetailsModal.secretKey')}</KeyTitle>
                                {!secretKeyVisible && (
                                    <ButtonContainer>
                                        <PasswordInput label={t('general.nouns.wallet_password')} password={password} onChange={(val) => setPassword(val)} containerStyle={{ width: '60%', marginTop: '10px' }} />
                                        <InvokeButton buttonTheme="primary" disabled={false} onClick={onShowSecretKey}>
                                            {t('general.verbs.show')}
                                        </InvokeButton>
                                    </ButtonContainer>
                                )}
                                {secretKeyVisible && (
                                    <>
                                        <KeyAddress>
                                            {secretKey}
                                            <CopyButton text={'Tezos Secret Key: ' + secretKey} title="" color="accent" />
                                        </KeyAddress>
                                    </>
                                )}
                            </KeyWrapper>
                        )}
                        {isLedger && (
                            <KeyWrapper>
                                <KeyTitle>{t('components.keyDetailsModal.secretKey')}</KeyTitle>
                                <SecretKeyMessage>{t('components.keyDetailsModal.hardwareSignerNotice')}</SecretKeyMessage>
                            </KeyWrapper>
                        )}
                    </Keys>
                </ModalContainer>
            ) : (
                <ModalContainer />
            )}
        </ModalWrapper>
    );
};

export default KeyDetails;
