import React, { useState } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { useHistory, RouteComponentProps } from 'react-router-dom';
import { Trans, withTranslation, WithTranslation } from 'react-i18next';
import i18n from 'i18next';

import Checkbox from '../../components/Checkbox/';
import TermsModal from '../../components/TermsModal';
import LanguageSelectModal from '../../components/LanguageSelectModal';
import { name } from '../../config.json';
import { setLocalData, getLocalData, resetLocalData } from '../../utils/localData';
import { changeLocaleThunk } from '../../reduxContent/settings/thunks';
// import { connectLedger } from '../../reduxContent/wallet/thunks';

import {
  SectionContainer,
  TermsAndPolicySection,
  Strong,
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
  BgContainerImg,
  BgCircle1,
  BgCircle2,
  BgCircle3,
  BgCircle4,
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

import bgHero from '../../../resources/bg-hero/bg-hero.jpg';
import bgCircle01 from '../../../resources/bg-hero/bg-circle_01.png';
import bgCircle02 from '../../../resources/bg-hero/bg-circle_02.png';
import bgCircle03 from '../../../resources/bg-hero/bg-circle_03.png';
import bgCircle04 from '../../../resources/bg-hero/bg-circle_04.png';

import keystoreImg from '../../../resources/imgs/Keystore.svg';
import ledgerUnconnectedImg from '../../../resources/ledger-unconnected.svg';
import ledgerConnectedImg from '../../../resources/ledger-connect.svg';

const LANGUAGE_STORAGE = 'isShowedLanguageScene';
const AGREEMENT_STORAGE = 'isPPAccepted';

interface OwnProps {
  locale: string;
  isLedgerConnecting: boolean;
  activePath: string;
  changeLocale: (locale: string) => void;
}
type Props = OwnProps & WithTranslation & RouteComponentProps<{ path: string }>;

function LoginHome(props: Props) {
  const history = useHistory();
  const { locale, match, isLedgerConnecting, activePath, changeLocale, t } = props;
  const [isAgreement, setIsAgreement] = useState(() => getLocalData(AGREEMENT_STORAGE));
  const [isLanguageSelected, setIsLanguageSelected] = useState(() =>
    getLocalData(LANGUAGE_STORAGE)
  );

  const ledgerImg = isLedgerConnecting ? ledgerConnectedImg : ledgerUnconnectedImg;
  // resetLocalData('wallet');

  function updateStatusAgreement() {
    setIsAgreement(!isAgreement);
    setLocalData(AGREEMENT_STORAGE, !isAgreement);
  }

  function onChangeLanguage(lang: string) {
    changeLocale(lang);
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
    // const { connectLedger } = this.props;
    // await connectLedger();
  }

  function onDownload() {
    const url = 'https://github.com/Cryptonomic/Deployments/wiki/Galleon:-Tutorials';
    openLink(url);
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
          <AppName>{name}</AppName>
        </NameSection>
        <Section>
          <CardContainer>
            <CardImg src={keystoreImg} />
            <CardTitle>{t('containers.loginHome.keystore_wallet')}</CardTitle>
            <CreateWalletButton
              color="secondary"
              variant="extended"
              onClick={() => goTo('create')}
              disabled={!isAgreement}
            >
              {t('containers.loginHome.create_new_wallet_btn')}
            </CreateWalletButton>
            <UnlockWalletButton
              color="primary"
              variant="outlined"
              onClick={() => goTo('import')}
              disabled={!isAgreement}
            >
              {t('containers.loginHome.open_exisiting_wallet_btn')}
            </UnlockWalletButton>
            <Linebar />
            <Tip>
              <div>{t('containers.loginHome.want_to_import_fundraiser_paper_wallet')}</div>
              <div>
                <Trans i18nKey="containers.loginHome.create_named_wallet" values={{ name }}>
                  wallet?
                  <Link onClick={() => goTo('create')}>
                    <Strong>Create a {name} wallet</Strong>
                  </Link>{' '}
                  first.
                </Trans>
              </div>
            </Tip>
          </CardContainer>
          <CardContainer>
            <CardImg src={ledgerImg} />

            <CardTitle>{t('containers.loginHome.ledger_wallet')}</CardTitle>
            <CreateWalletButton
              color="secondary"
              variant="extended"
              onClick={() => onLedgerConnect()}
              disabled={!isAgreement}
            >
              {isLedgerConnecting && t('containers.loginHome.connecting')}
              {!isLedgerConnecting && t('containers.loginHome.connect_ledger')}
            </CreateWalletButton>
            {activePath && (
              <SelectedPath>
                {t('containers.loginHome.selectedPath')} {activePath}
              </SelectedPath>
            )}
            {isLedgerConnecting && (
              <LedgerConnect>
                <Trans i18nKey="containers.loginHome.connect_your_device">
                  Please
                  <DescriptionBold> connect your device</DescriptionBold>,
                  <DescriptionBold> enter your pin</DescriptionBold>, and
                  <DescriptionBold> open Tezos Wallet app</DescriptionBold>.
                </Trans>
              </LedgerConnect>
            )}
            <Linebar />
            <Tip>
              <div>{t('containers.loginHome.dont_have_ledger_wallet')}</div>
              <div>
                <Link onClick={() => onDownload()}>
                  <Strong>{t('containers.loginHome.download_it_here')}</Strong>
                </Link>
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
      <Background>
        <BgContainerImg src={bgHero} />
        <BgCircle1 src={bgCircle01} />
        <BgCircle2 src={bgCircle02} />
        <BgCircle3 src={bgCircle03} />
        <BgCircle4 src={bgCircle04} />
      </Background>
    </SectionContainer>
  );
}

const mapStateToProps = (state: RootState) => ({
  locale: state.settings.locale,
  isLedgerConnecting: state.app.isLedgerConnecting,
  activePath: state.settings.selectedPath
});

const mapDispatchToProps = dispatch => ({
  changeLocale: (locale: string) => dispatch(changeLocaleThunk(locale))
  // connectLedger
});

export default compose(
  withTranslation(),
  connect(mapStateToProps, mapDispatchToProps)
)(LoginHome) as React.ComponentType<any>;
