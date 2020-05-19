import React, { useState, useEffect } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { TezosWalletUtil, TezosLedgerWallet } from 'conseiljs';

import { getSelectedKeyStore } from '../../utils/general';
import { getMainPath } from '../../utils/settings';
import Loader from '../../components/Loader';
import CustomTextArea from '../../components/CustomTextArea';
import CopyButton from '../../components/CopyButton';
import { RootState } from '../../types/store';

import {
    ModalWrapper,
    ModalContainer,
    CloseIconWrapper,
    ModalTitle,
    Container,
    MainContainer,
    ButtonContainer,
    ResultContainer,
    InvokeButton,
    Result
} from '../style';

interface Props {
    open: boolean;
    onClose: () => void;
}

const Auth = (props: Props) => {
    const { t } = useTranslation();
    const { isLoading, isLedger, selectedParentHash } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
    const activeModal = useSelector<RootState, string>((state: RootState) => state.modal.activeModal);
    const { identities } = useSelector((rootState: RootState) => rootState.wallet, shallowEqual);
    const { settings } = useSelector((rootState: RootState) => rootState, shallowEqual);
    const values = useSelector<RootState, object>(state => state.modal.values, shallowEqual);
    const [message, setMessage] = useState('');
    const [result, setResult] = useState('');
    const [error, setError] = useState(false);
    const { open, onClose } = props;
    const isDisabled = isLoading || !message;
    const { selectedPath, pathsList } = settings;
    const derivationPath = isLedger ? getMainPath(pathsList, selectedPath) : '';

    const onAuth = async () => {
        const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger, derivationPath);

        let signature: string;
        if (isLedger) {
            signature = await TezosLedgerWallet.signText(keyStore.derivationPath || '', message);
        } else {
            signature = await TezosWalletUtil.signText(keyStore, message);
        }

        const req = values[activeModal]; // TODO: this should be an enum or constant, not a state lookup
        try {
            console.log(`base url "${req.c}"`);
            console.log(`sending "${req.c}&sig=${new Buffer(signature).toString('base64')}"`);
            const response = await fetch(`${req.c}&sig=${new Buffer(signature).toString('base64')}`);
            console.log(`request sent`);
            console.log(response);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const req = values[activeModal];
        if (req && req.p) {
            setMessage(req.p);

            console.log(JSON.stringify(req));
        }
    }, []);
    /*
r: "Most Awesome dApp", // Requestor
d: "The best and only dApp on Tezos", // Description
u: "https://localhost:8080/", // Requestor URL
p: req.session.words, // Prompt
c: `https://localhost:8080/validate?sid=${req.session.id}`, // Callback URL
t: req.param('address') // Target address
*/
    return (
        <ModalWrapper open={open}>
            {open ? (
                <ModalContainer>
                    <CloseIconWrapper onClick={() => onClose()} />
                    <ModalTitle>{t('components.AuthenticateModal.title')}</ModalTitle>
                    <Container>
                        <MainContainer>
                            {/*
                            r link-box (u)
                            d

                            p (non-editable)
                            
                            */}
                            <CustomTextArea label={t('general.nouns.message')} onChange={val => setMessage(val)} defaultValue={message} />
                        </MainContainer>
                        <ResultContainer>
                            <Result error={error}>{result}</Result>
                            {!error && result && <CopyButton text={result} title="" color="accent" />}
                        </ResultContainer>
                        <ButtonContainer>
                            <InvokeButton buttonTheme="primary" disabled={isDisabled} onClick={onAuth}>
                                {t('general.verbs.authenticate')}
                            </InvokeButton>
                        </ButtonContainer>
                    </Container>
                    {isLoading && <Loader />}
                </ModalContainer>
            ) : (
                <ModalContainer />
            )}
        </ModalWrapper>
    );
};

export default Auth;
