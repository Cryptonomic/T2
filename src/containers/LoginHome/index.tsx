import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, RouteComponentProps } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import i18n from 'i18next';

import Checkbox from '../../components/Checkbox/';
import TermsModal from '../../components/TermsModal';
import LanguageSelectModal from '../../components/LanguageSelectModal';
import { name, ledgerReferral } from '../../config.json';
import { setLocalData, getLocalData, resetLocalData } from '../../utils/localData';
import { changeLocaleThunk } from '../Settings/duck/thunk';
import { connectLedgerThunk } from '../../reduxContent/wallet/thunks';
import { getSelectedPath } from '../../reduxContent/settings/selectors';
import { ledgerAppUrl } from '../../config.json';

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
    SelectedPath
} from './style';

import { openLink } from '../../utils/general';
import { RootState } from '../../types/store';

import keystoreImg from '../../../resources/imgs/Keystore.svg';
import ledgerUnconnectedImg from '../../../resources/ledger-unconnected.svg';
import ledgerConnectedImg from '../../../resources/ledger-connect.svg';

const LANGUAGE_STORAGE = 'isShowedLanguageScene';
const AGREEMENT_STORAGE = 'isPPAccepted';

type Props = RouteComponentProps<{ path: string }>;

function LoginHome(props: Props) {
    const { match } = props;
    const history = useHistory();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const locale = useSelector((state: RootState) => state.settings.locale);
    const activePath = useSelector(getSelectedPath);
    const isLedgerConnecting = useSelector((state: RootState) => state.app.isLedgerConnecting);
    const [isAgreement, setIsAgreement] = useState(() => getLocalData(AGREEMENT_STORAGE));
    const [isLanguageSelected, setIsLanguageSelected] = useState(() => getLocalData(LANGUAGE_STORAGE));

    const ledgerImg = isLedgerConnecting ? ledgerConnectedImg : ledgerUnconnectedImg;
    // resetLocalData('wallet');

    function updateStatusAgreement() {
        setIsAgreement(!isAgreement);
        setLocalData(AGREEMENT_STORAGE, !isAgreement);
    }

    function onChangeLanguage(lang: string) {
        dispatch(changeLocaleThunk(lang));
        i18n.changeLanguage(lang);
    }

    function goToTermsModal() {
        setIsLanguageSelected(!isLanguageSelected);
        setLocalData(LANGUAGE_STORAGE, !isLanguageSelected);
    }

    function goToLanguageSelect() {
        setLocalData(LANGUAGE_STORAGE, !isLanguageSelected);
        setIsLanguageSelected(!isLanguageSelected);
    }

    function goTo(route) {
        history.push(`${match.path}/${route}`);
    }

    async function onLedgerConnect() {
        await dispatch(connectLedgerThunk());
    }

    function onDownload() {
        openLink(ledgerAppUrl);
    }

    function onOrderDevice() {
        openLink(ledgerReferral);
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
                    <AppName>{t('containers.loginHome.app_name', { name })}</AppName>
                </NameSection>
                <Section>
                    <CardContainer>
                        <CardImg src={ledgerImg} />

                        <CardTitle>{t('containers.loginHome.ledger_wallet')}</CardTitle>
                        <UnlockWalletButton color="secondary" variant="extended" onClick={() => onLedgerConnect()} disabled={!isAgreement}>
                            {isLedgerConnecting && t('containers.loginHome.connecting')}
                            {!isLedgerConnecting && t('containers.loginHome.connect_ledger')}
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
                            <div>{t('containers.loginHome.dont_have_ledger_wallet')}</div>
                            <div>
                                <Link onClick={() => onDownload()}>{t('containers.loginHome.download_it_here')}</Link>
                            </div>
                        </Tip>
                        <Tip>
                            <div>
                                {t('containers.loginHome.need_device')}&nbsp;
                                <Link onClick={() => onOrderDevice()}>{t('containers.loginHome.get_it_here')}</Link>
                            </div>
                        </Tip>
                    </CardContainer>
                    <CardContainer>
                        <CardImg src={keystoreImg} />
                        <CardTitle>{t('containers.loginHome.keystore_wallet')}</CardTitle>
                        <UnlockWalletButton color="secondary" variant="extended" onClick={() => goTo('import')} disabled={!isAgreement}>
                            {t('containers.loginHome.open_exisiting_wallet_btn')}
                        </UnlockWalletButton>
                        <CreateWalletButton color="primary" variant="outlined" onClick={() => goTo('create')} disabled={!isAgreement}>
                            {t('containers.loginHome.create_new_wallet_btn')}
                        </CreateWalletButton>
                        <Linebar />
                        <Tip>
                            <div>
                                {t('containers.loginHome.want_to_import_fundraiser_paper_wallet')}
                                <Trans i18nKey="containers.loginHome.create_named_wallet">
                                    <Link onClick={() => goTo('create')}>Create a wallet</Link> first.
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
            <LanguageSelectModal
                isOpen={!isLanguageSelected}
                onLanguageChange={onChangeLanguage}
                selectedLanguage={locale}
                onContinue={() => goToTermsModal()}
            />
            <TermsModal
                goTo={goTo}
                isOpen={!isAgreement && isLanguageSelected}
                agreeTermsAndPolicy={() => updateStatusAgreement()}
                onBack={goToLanguageSelect}
            />
            <Background />
        </SectionContainer>
    );
}

export default LoginHome;
