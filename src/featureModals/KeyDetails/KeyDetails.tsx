import React, { Fragment, useState, useEffect } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { getSelectedKeyStore } from '../../utils/general';
import { getMainPath } from '../../utils/settings';
import CopyButton from '../../components/CopyButton';
import { RootState } from '../../types/store';

import {
    CloseIconWrapper,
    Container,
    MessageContainer,
    ModalContainer,
    ModalTitle,
    ModalWrapper,
    KeyWrapper,
    KeyTitle,
    KeyAddress,
    Keys,
    SecretKeyMessage,
} from '../style';

interface Props {
    open: boolean;
    onClose: () => void;
}

const KeyDetails = (props: Props) => {
    const { t } = useTranslation();
    const { isLedger, selectedParentHash } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
    const { identities } = useSelector((rootState: RootState) => rootState.wallet, shallowEqual);
    const { settings } = useSelector((rootState: RootState) => rootState, shallowEqual);
    const { open, onClose } = props;
    const { selectedPath, pathsList } = settings;
    const derivationPath = isLedger ? getMainPath(pathsList, selectedPath) : '';

    const [address, setAddress] = useState('');
    const [publicKey, setPublicKey] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [secretKeyVisible, setSecretKeyVisible] = useState(false);

    useEffect(() => {
        const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger, derivationPath);
        setAddress(keyStore.publicKeyHash);
        setPublicKey(keyStore.publicKey);
        setSecretKey(keyStore.secretKey);
    }, []);

    return (
        <ModalWrapper open={open}>
            {open ? (
                <ModalContainer>
                    <CloseIconWrapper onClick={() => onClose()} />
                    <ModalTitle>{t('components.keyDetailsModal.secretKey')}</ModalTitle>
                    <Keys>
                        <KeyWrapper>
                            <KeyTitle>{t('components.keyDetailsModal.Address')}</KeyTitle>
                            <KeyAddress>
                                {address}
                                <CopyButton text={address} title="" color="accent" />
                            </KeyAddress>
                        </KeyWrapper>
                        <KeyWrapper>
                            <KeyTitle>{t('components.keyDetailsModal.publicKey')}</KeyTitle>
                            <KeyAddress>
                                {publicKey}
                                <CopyButton text={publicKey} title="" color="accent" />
                            </KeyAddress>
                        </KeyWrapper>
                        {!isLedger && (
                            <KeyWrapper>
                                <KeyTitle>{t('components.keyDetailsModal.secretKey')}</KeyTitle>
                                {!secretKeyVisible && (
                                    <SecretKeyMessage onClick={() => setSecretKeyVisible(!secretKeyVisible)}>
                                        {t('components.keyDetailsModal.secretKeyNotice')}
                                    </SecretKeyMessage>
                                )}
                                {secretKeyVisible && (
                                    <>
                                        <KeyAddress>
                                            {secretKey}
                                            <CopyButton text={secretKey} title="" color="accent" />
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
