import React, { useState, useEffect } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { TezosWalletUtil, TezosLedgerWallet } from 'conseiljs';

import { ms } from '../../styles/helpers';
import { getSelectedKeyStore, openLink } from '../../utils/general';
import { getMainPath } from '../../utils/settings';
import Loader from '../../components/Loader';
import CopyButton from '../../components/CopyButton';
import Tooltip from '../../components/Tooltip';
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
    Result,
    LinkIcon,
    LinkContainer,
    ContentTitle,
    ContentSubtitle,
    Footer,
    TitleContainer,
    TooltipContent,
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
    const values = useSelector<RootState, object>((state) => state.modal.values, shallowEqual);
    const [result, setResult] = useState('');
    const [error, setError] = useState(false);
    const { open, onClose } = props;
    const { selectedPath, pathsList } = settings;
    const derivationPath = isLedger ? getMainPath(pathsList, selectedPath) : '';

    const [requestor, setRequestor] = useState('');
    const [requestorDescription, setRequestorDescription] = useState('');
    const [requestorUrl, setRequestorUrl] = useState('');
    const [prompt, setPrompt] = useState('');

    const isDisabled = isLoading || !prompt;

    const onAuth = async () => {
        const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger, derivationPath);

        let signature: string;
        if (isLedger) {
            signature = await TezosLedgerWallet.signText(keyStore.derivationPath || '', prompt);
        } else {
            signature = await TezosWalletUtil.signText(keyStore, prompt);
        }

        const req = values[activeModal]; // TODO: this should be an enum or constant, not a state lookup
        try {
            setResult('Signature sent'); // TODO: localization
            setError(false);
            const response = await fetch(`${req.c}&sig=${new Buffer(signature).toString('base64')}`);
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
                let p = req.prompt.replace(/\n/g, '');
                p = p.slice(0, Math.min(100, p.length));
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
                            <div>{prompt}</div>
                        </MainContainer>
                        <ResultContainer>
                            <Result error={error}>{result}</Result>
                            {!error && result && <CopyButton text={result} title="" color="accent" />}
                        </ResultContainer>
                        <Footer>
                            <ButtonContainer>
                                <InvokeButton buttonTheme="primary" disabled={isDisabled} onClick={onAuth}>
                                    {t('general.verbs.authenticate')}
                                </InvokeButton>
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
