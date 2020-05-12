import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import BackButton from '../../components/BackButton';
import { H2 } from '../../components/Heading';
import PdfReader from '../../components/PdfReader';
import { termsService, privacyPolicy } from '../../config.json';
import { Container, BackButtonContainer } from './style';

const LoginConditions = () => {
    const { type } = useParams();
    const { t } = useTranslation();
    let title = 'Privacy Policy';
    let url = privacyPolicy;
    if (type === 'termsOfService') {
        title = 'Terms Of Service';
        url = termsService;
    }

    return (
        <Container>
            <BackButtonContainer>
                <BackButton label={t('general.back')} />
            </BackButtonContainer>
            <H2>{title}</H2>
            <PdfReader pdfUrl={url} />
        </Container>
    );
};

export default LoginConditions;
