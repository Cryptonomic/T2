import React, { useState, useEffect } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ms } from '../../../../styles/helpers';
import { openLink } from '../../../../utils/general';
import Loader from '../../../../components/Loader';
import Tooltip from '../../../../components/Tooltip';
import { RootState } from '../../../../types/store';

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
} from '../../../../featureModals/style';

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

const DeployOvenModal = (props: Props) => {
    const { t } = useTranslation();
    const { isLoading, selectedParentHash, signer } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
    const activeModal = useSelector<RootState, string>((state: RootState) => state.modal.activeModal);
    const values = useSelector<RootState, object>((state) => state.modal.values, shallowEqual);
    const [result, setResult] = useState('');
    const [error, setError] = useState(false);
    const { open, onClose } = props;

    const [requestor, setRequestor] = useState('');
    const [requestorDescription, setRequestorDescription] = useState('');
    const [requestorUrl, setRequestorUrl] = useState('');
    const [prompt, setPrompt] = useState('');

    const isDisabled = isLoading || !prompt;

    const onAuth = async () => {
        if (signer == null) {
            setError(true);
            setResult('No signing mechanism available');
            console.error(error);
            return;
        }

        const signature = await signer.signText(prompt);

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

                            <Container onKeyDown={(event) => onEnterPress(event.key)}>
                                <RowContainer>
                                    <MessageContainer>
                                        <InfoIcon color="info" iconName="info" />
                                        {t('components.send.mint_notice')}
                                    </MessageContainer>
                                </RowContainer>
                                <RowContainer>
                                    <InputAddress
                                        label={t('components.send.recipient_address')}
                                        operationType="send"
                                        tooltip={false}
                                        onChange={(val) => setAddress(val)}
                                        onIssue={(val) => setIsAddressIssue(val)}
                                    />
                                </RowContainer>
                                <RowContainer>
                                    <AmountContainer>
                                        <NumericInput
                                            label={t('general.nouns.amount')}
                                            amount={amount}
                                            onChange={(val) => setAmount(val)}
                                            errorText={error}
                                            symbol={token.symbol}
                                            scale={token.scale || 0}
                                            precision={token.precision || 6}
                                            minValue={new BigNumber(1).dividedBy(10 ** (token.scale || 0)).toNumber()}
                                        />
                                    </AmountContainer>
                                    <FeeContainer>
                                        <Fees
                                            low={newFees.low}
                                            medium={newFees.medium}
                                            high={newFees.high}
                                            fee={fee}
                                            miniFee={miniFee}
                                            onChange={(val) => setFee(val)}
                                        />
                                    </FeeContainer>
                                </RowContainer>

                                <PasswordButtonContainer>
                                    {!isLedger && (
                                        <PasswordInput
                                            label={t('general.nouns.wallet_password')}
                                            password={passPhrase}
                                            onChange={(val) => setPassPhrase(val)}
                                            containerStyle={{ width: '47%', marginTop: '10px' }}
                                        />
                                    )}
                                    <InvokeButton buttonTheme="primary" disabled={isDisabled} onClick={() => onAction()}>
                                        {t('general.verbs.mint')}
                                    </InvokeButton>
                                </PasswordButtonContainer>
                                {isLedger && open && (
                                    <TokenLedgerConfirmationModal
                                        fee={fee}
                                        to={newAddress}
                                        source={selectedParentHash}
                                        amount={amount}
                                        open={open}
                                        onClose={() => setOpen(false)}
                                        isLoading={isLoading}
                                        op={MINT}
                                        symbol={token.symbol}
                                    />
                                )}
                            </Container>
                        </MainContainer>
                        <ResultContainer>
                            <Result error={error}>{result}</Result>
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

export default DeployOvenModal;
