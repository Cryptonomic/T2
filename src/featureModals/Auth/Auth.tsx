import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';

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
    const isLoading = useSelector<RootState, boolean>((state: RootState) => state.app.isLoading);
    const activeModal = useSelector<RootState, string>((state: RootState) => state.modal.activeModal);
    const values = useSelector<RootState, object>(state => state.modal.values, shallowEqual);
    const [message, setMessage] = useState('');
    const [result, setResult] = useState('');
    const [error, setError] = useState(false);
    const { open, onClose } = props;
    const isDisabled = isLoading || !message;

    const onAuth = async () => {
        // TODO: onAuth
    };

    useEffect(() => {
        const { r } = values[activeModal];
        if (r) {
            setMessage(r);
        }
    }, []);

    return (
        <ModalWrapper open={open}>
            {open ? (
                <ModalContainer>
                    <CloseIconWrapper onClick={() => onClose()} />
                    <ModalTitle>{`dApp ${t('general.verbs.authenticate')}`}</ModalTitle>
                    <Container>
                        <MainContainer>
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
