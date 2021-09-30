import React from 'react';
import styled from 'styled-components';
import Modal from '@mui/material/Modal';
import { Trans, useTranslation } from 'react-i18next';
import Button from '../Button';
import BackButton from '../BackButton';
import { name } from '../../config.json';
import termsLogoIcon from '../../../resources/imgs/ToS_PP_icon.svg';

export const ModalContent = styled.div`
    position: absolute;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    bottom: 0;
    background-color: ${({ theme: { colors } }) => colors.white};
    outline: none;
`;

const Container = styled.div`
    width: 508px;
    padding: 40px 0;
`;

const Title = styled.div`
    color: ${({ theme: { colors } }) => colors.primary};
    font-weight: 400;
    font-size: 36px;
    line-height: 40px;
    letter-spacing: 0.1px;
`;

const TermsLogo = styled.img`
    width: 197px;
    height: 197px;
`;

const MainContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin: 32px 0 75px 0;
`;

const BottomContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Description = styled.div`
    color: ${({ theme: { colors } }) => colors.primary};
    font-weight: 300;
    flex: 1;
    font-size: 18px;
    line-height: 26px;
    letter-spacing: 0.1px;
    margin-top: 22px;
`;

const Link = styled.span`
    color: ${({ theme: { colors } }) => colors.accent};
    cursor: pointer;
    font-weight: ${({
        theme: {
            typo: { weights },
        },
    }) => weights.normal};
`;

const AgreeButton = styled(Button)`
    width: 194px;
    height: 50px;
    padding: 0;
`;

interface Props {
    isOpen: boolean;
    onClose: () => void;
    goTo: (url: string) => void;
    agreeTermsAndPolicy: () => void;
    onBack: () => void;
}

function TermsModal(props: Props) {
    const { goTo, isOpen, agreeTermsAndPolicy, onBack, onClose } = props;
    const { t } = useTranslation();

    function openTermsService() {
        goTo('conditions/termsOfService');
    }
    function openPrivacyPolicy() {
        goTo('conditions/privacyPolicy');
    }

    function onModalClose(_event, reason) {
        if (reason !== 'backdropClick') {
            onClose();
        }
    }

    return (
        <Modal open={isOpen} onClose={onModalClose}>
            <ModalContent>
                <Container>
                    <Title>{t('components.termsModal.welcome_to', { name })}</Title>
                    <MainContainer>
                        <TermsLogo src={termsLogoIcon} />
                        <Description>
                            <Trans i18nKey="components.termsModal.description">
                                Before we get started, please read our
                                <Link onClick={openTermsService}> Terms of Service </Link>
                                and
                                <Link onClick={openPrivacyPolicy}> Privacy Policy</Link>
                            </Trans>
                        </Description>
                    </MainContainer>
                    <BottomContainer>
                        <BackButton label={t('general.back')} onClick={() => onBack()} />
                        <AgreeButton buttonTheme="primary" onClick={() => agreeTermsAndPolicy()}>
                            {t('components.termsModal.i_agree')}
                        </AgreeButton>
                    </BottomContainer>
                </Container>
            </ModalContent>
        </Modal>
    );
}

export default TermsModal;
