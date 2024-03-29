import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import Drawer from '@mui/material/Drawer';
import i18n from 'i18next';

import LandingCar from '../Landing';
import Checkbox from '../../components/Checkbox';
import config from '../../config.json';
import { setLocalData, getLocalData, resetLocalData } from '../../utils/localData';
import { changeLocaleThunk } from '../Settings/duck/thunk';
import { connectLedgerThunk } from '../../reduxContent/wallet/thunks';
import { getSelectedPath } from '../../reduxContent/settings/selectors';

import {
    SectionContainer,
    TermsAndPolicySection,
    Link,
    Description,
    Tip,
    AppName,
    CreateWalletButton,
    UnlockWalletButton,
    DefaultContainer,
    NameSection,
    Section,
    Background,
    CardContainer,
    CardImg,
    CardTitle,
    Linebar,
    LedgerConnect,
    DescriptionBold,
    SelectedPath,
} from './style';

import { openLink } from '../../utils/general';
import { RootState } from '../../types/store';

import keystoreImg from '../../../resources/imgs/Keystore.svg';
import ledgerUnconnectedImg from '../../../resources/ledger-unconnected.svg';
import ledgerConnectedImg from '../../../resources/ledger-connect.svg';

const { name, ledgerReferral, ledgerAppUrl } = config;

const INIT_SCENE = 'isShowedInitScene';
const AGREEMENT_STORAGE = 'isPPAccepted';

// type Props = RouteComponentProps<{ path: string }>;

function LoginHome() {
    // const { match } = props;
    const match = { path: '' };
    const navigate = useNavigate();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const locale = useSelector((state: RootState) => state.settings.locale);
    const activePath = useSelector(getSelectedPath);
    const isLedgerConnecting = useSelector((state: RootState) => state.app.isLedgerConnecting);
    const [isAgreement, setIsAgreement] = useState(() => getLocalData(AGREEMENT_STORAGE));
    const [isShowedInitScene, setIsShowedInitScene] = useState(() => getLocalData(INIT_SCENE));

    const ledgerImg = isLedgerConnecting ? ledgerConnectedImg : ledgerUnconnectedImg;
    // resetLocalData('isShowedInitScene');
    // resetLocalData(AGREEMENT_STORAGE);

    function onChangeLanguage(lang: string) {
        dispatch(changeLocaleThunk(lang));
        i18n.changeLanguage(lang);
    }

    function updateStatusAgreement() {
        setIsAgreement(!isAgreement);
        setLocalData(AGREEMENT_STORAGE, !isAgreement);
    }

    function goToMain() {
        setIsShowedInitScene(!isShowedInitScene);
        setIsAgreement(true);
        setLocalData(INIT_SCENE, !isShowedInitScene);
        setLocalData(AGREEMENT_STORAGE, true);
    }

    function goTo(route) {
        navigate(route);
    }

    async function onLedgerConnect() {
        await dispatch(connectLedgerThunk());
    }

    function openTermsService() {
        goTo('conditions/termsOfService');
    }

    function openPrivacyPolicy() {
        goTo('conditions/privacyPolicy');
    }

    return (
        <SectionContainer>
            <DefaultContainer>
                <NameSection>
                    <AppName>{t('containers.loginHome.app_name', { name }) as string}</AppName>
                </NameSection>
                <Section>
                    <CardContainer>
                        <CardImg src={ledgerImg} />

                        <CardTitle>{t('containers.loginHome.ledger_wallet') as string}</CardTitle>
                        <UnlockWalletButton color="secondary" variant="extended" onClick={() => onLedgerConnect()} disabled={!isAgreement}>
                            {isLedgerConnecting && (t('containers.loginHome.connecting') as string)}
                            {!isLedgerConnecting && (t('containers.loginHome.connect_ledger') as string)}
                        </UnlockWalletButton>
                        {activePath && (
                            <SelectedPath>
                                {t('containers.loginHome.selectedPath')} {activePath}
                            </SelectedPath>
                        )}
                        {isLedgerConnecting && (
                            <LedgerConnect>
                                <Trans i18nKey="containers.loginHome.connect_your_device">
                                    Please
                                    <DescriptionBold> connect your device</DescriptionBold>,<DescriptionBold> enter your pin</DescriptionBold>, and
                                    <DescriptionBold> open Tezos Wallet app</DescriptionBold>.
                                </Trans>
                            </LedgerConnect>
                        )}
                        <Linebar />
                        <Tip>
                            <div>{t('containers.loginHome.dont_have_ledger_wallet') as string}</div>
                            <div>
                                <Link onClick={() => openLink(ledgerAppUrl)}>{t('containers.loginHome.download_it_here') as string}</Link>
                            </div>
                        </Tip>
                        <Tip>
                            <div>
                                {t('containers.loginHome.need_device')}&nbsp;
                                <Link onClick={() => openLink(ledgerReferral)}>{t('containers.loginHome.get_it_here') as string}</Link>
                            </div>
                        </Tip>
                    </CardContainer>
                    <CardContainer>
                        <CardImg src={keystoreImg} />
                        <CardTitle>{t('containers.loginHome.keystore_wallet') as string}</CardTitle>
                        <UnlockWalletButton color="secondary" variant="extended" onClick={() => goTo('/login/import')} disabled={!isAgreement}>
                            {t('containers.loginHome.open_existing_wallet_btn') as string}
                        </UnlockWalletButton>
                        <CreateWalletButton color="primary" variant="outlined" onClick={() => goTo('/login/create')} disabled={!isAgreement}>
                            {t('containers.loginHome.create_new_wallet_btn') as string}
                        </CreateWalletButton>
                        <Linebar />
                        <Tip>
                            <div>
                                {t('containers.loginHome.want_to_import_fundraiser_paper_wallet')}
                                <Trans i18nKey="containers.loginHome.create_named_wallet">
                                    <Link onClick={() => goTo('/login/create')}>Create a wallet</Link> first.
                                </Trans>
                            </div>
                        </Tip>
                    </CardContainer>
                </Section>
            </DefaultContainer>
            <TermsAndPolicySection>
                <Checkbox isChecked={isAgreement} onCheck={() => updateStatusAgreement()} />
                <Description>
                    <Trans i18nKey="containers.loginHome.description">
                        I acknowledge that I have read and accepted the
                        <Link onClick={() => openTermsService()}> Terms of Service </Link>
                        and
                        <Link onClick={() => openPrivacyPolicy()}> Privacy Policy</Link>
                    </Trans>
                </Description>
            </TermsAndPolicySection>
            <Drawer anchor="bottom" open={!isShowedInitScene}>
                <LandingCar selectedLanguage={locale} onLanguageChange={onChangeLanguage} onContinue={() => goToMain()} goTo={goTo} />
            </Drawer>
        </SectionContainer>
    );
}

export default LoginHome;
