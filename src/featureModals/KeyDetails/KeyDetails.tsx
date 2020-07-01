import React, { Fragment, useState, useEffect } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { getSelectedKeyStore } from '../../utils/general';
import { getMainPath } from '../../utils/settings';
import CopyButton from '../../components/CopyButton';
import { RootState } from '../../types/store';

import { CloseIconWrapper, Container, MessageContainer, ModalContainer, ModalTitle, ModalWrapper } from '../style';

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
                    <ModalTitle>{t('components.balanceBanner.secret_key')}</ModalTitle>
                    <Container>
                        <h4>Address</h4>
                        <p>{address}</p>
                        <CopyButton text={address} title="" color="accent" />
                        <h4>Public Key</h4>
                        <p>{publicKey}</p>
                        <CopyButton text={publicKey} title="" color="accent" />
                        {!isLedger && (
                            <Fragment>
                                <h4>Secret Key</h4>
                                <MessageContainer onClick={() => setSecretKeyVisible(!secretKeyVisible)}>
                                    {t('components.balanceBanner.warning')}
                                    {t('components.balanceBanner.do_not_store')}
                                </MessageContainer>
                                {secretKeyVisible && (
                                    <Fragment>
                                        <p>{secretKey}</p>
                                        <CopyButton text={secretKey} title="" color="accent" />
                                    </Fragment>
                                )}
                            </Fragment>
                        )}
                        {!isLedger && <Fragment>{/* Some message about hardware signers */}</Fragment>}
                    </Container>
                </ModalContainer>
            ) : (
                <ModalContainer />
            )}
        </ModalWrapper>
    );
};

export default KeyDetails;
