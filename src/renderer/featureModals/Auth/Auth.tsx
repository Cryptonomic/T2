import React, { useState, useEffect } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import * as bip39 from 'bip39';

import { ms } from '../../styles/helpers';
import { openLink } from '../../utils/general';
import Loader from '../../components/Loader';
import Tooltip from '../../components/Tooltip';
import { RootState } from '../../types/store';
import PasswordInput from '../../components/PasswordInput';

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
    Result,
    LinkIcon,
    LinkContainer,
    ContentTitle,
    ContentSubtitle,
    Footer,
    TitleContainer,
    TooltipContent,
} from '../style';

export const PromptContainer = styled.div`
    align-items: center;
    color: #979797;
    display: flex;
    font-size: 24px;
    justify-content: center;
    height: 80px;
    margin-top: 30px;
    width: 100%;
`;

interface Props {
    open: boolean;
    onClose: () => void;
}

const Auth = (props: Props) => {
    const { t } = useTranslation();
    const { isLoading, selectedParentHash, isLedger, signer } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
    const activeModal = useSelector<RootState, string>((state: RootState) => state.modal.activeModal);
    const values = useSelector<RootState, object>((state) => state.modal.values, shallowEqual);
    const [result, setResult] = useState('');
    const [error, setError] = useState(false);
    const { open, onClose } = props;

    const [requestor, setRequestor] = useState('');
    const [requestorDescription, setRequestorDescription] = useState('');
    const [requestorUrl, setRequestorUrl] = useState('');
    const [prompt, setPrompt] = useState('');
    const [password, setPassword] = useState('');

    const isDisabled = isLoading || !prompt;

    const onAuth = async () => {
        if (signer == null) {
            setError(true);
            setResult('No signing mechanism available');
            console.error(error);
            return;
        }

        const signature = await signer.signText(prompt, password);

        const req = values[activeModal]; // TODO: this should be an enum or constant, not a state lookup
        try {
            setResult('Signature sent'); // TODO: localization
            setError(false);
            const response = await fetch(`${req.callback}&sig=${Buffer.from(signature).toString('base64')}`);
            if (!response.ok) {
                throw new Error('Signature response rejected'); // TODO: localization
            }
        } catch (error) {
            setError(true);
            setResult('Signature submission failed'); // TODO: localization
            console.error(error);
        }
    };

    const onClick = (link: string) => {
        openLink(link);
    };

    useEffect(() => {
        const req = values[activeModal];
        if (req) {
            if (req.requestor) {
                setRequestor(req.requestor);
            }

            if (req.desc) {
                setRequestorDescription(req.desc);
            }

            if (req.requrl) {
                setRequestorUrl(req.requrl);
            }

            if (req.prompt) {
                const stringPrompt = String(req.prompt);
                let p = stringPrompt.replace(/\n/g, '');
                p = p.slice(0, Math.min(100, p.length));

                if (
                    !p
                        .split(' ')
                        .map((w) => bip39.wordlists[bip39.getDefaultWordlist()].includes(w))
                        .reduce((r, b) => r && b)
                ) {
                    setError(true);
                    setResult('Prompt contains invalid data'); // TODO: localization
                }

                setPrompt(p);
            }

            if (req.target && req.target !== selectedParentHash) {
                setError(true);
                setResult('Account address mismatch'); // TODO: localization
            }

            if (!req.target) {
                setError(true);
                setResult('Missing target address'); // TODO: localization
            }

            if (!req.requrl) {
                setError(true);
                setResult('Missing dApp link'); // TODO: localization
            }
        }
    }, []);

    return (
        <ModalWrapper open={open}>
            {open ? (
                <ModalContainer>
                    <CloseIconWrapper onClick={() => onClose()} />
                    <ModalTitle>{t('components.AuthenticateModal.title')}</ModalTitle>
                    <Container>
                        <MainContainer>
                            <TitleContainer>
                                <LinkContainer onClick={() => onClick(requestorUrl)} key={requestorUrl}>
                                    <ContentTitle>
                                        {requestor}
                                        <Tooltip position="bottom" content={<TooltipContent>{`Open ${requestorUrl} in a browser`}</TooltipContent>}>
                                            <LinkIcon iconName="new-window" size={ms(0)} color="black" />
                                        </Tooltip>
                                    </ContentTitle>
                                </LinkContainer>
                                <ContentSubtitle>{requestorDescription}</ContentSubtitle>
                            </TitleContainer>
                            <div>{t('components.AuthenticateModal.signature_prompt')}</div>
                            <PromptContainer>{prompt}</PromptContainer>
                        </MainContainer>
                        <ResultContainer>
                            <Result error={error}>{result}</Result>
                        </ResultContainer>
                        <Footer>
                            <ButtonContainer>
                                {!isLedger && (
                                    <PasswordInput
                                        label={t('general.nouns.wallet_password')}
                                        password={password}
                                        onChange={(val) => setPassword(val)}
                                        containerStyle={{ width: '60%', marginTop: '10px' }}
                                    />
                                )}
                                {!error && (
                                    <InvokeButton buttonTheme="primary" disabled={isDisabled} onClick={onAuth}>
                                        {t('general.verbs.authenticate')}
                                    </InvokeButton>
                                )}
                            </ButtonContainer>
                        </Footer>
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
