import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';

import LanguageSelector from '../../components/LanguageSelector';
import termsLogoIcon from '../../../resources/imgs/Tos.svg';
import { name } from '../../config.json';
import localesMap from '../../constants/LocalesMap';

import {
    Container,
    Container1,
    MainContainer,
    WelcomeTxt,
    CarouselIndicator,
    ButtonContainer,
    BackCaret,
    NextCaret,
    LangTitle,
    LanguageContainer,
    TermsLogo,
    TosContainer,
    TosDesTxt,
    Link,
    ThirdTxt,
    FormGroupWrapper,
    FormControlLabelWrapper,
    CheckBoxWrapper,
    StartBtn,
} from './style';

const SLIDESLIST = [0, 1, 2, 3];
const numberOfLocales = Object.keys(localesMap).length;

interface Props {
    onLanguageChange: (scale: string) => void;
    onContinue: () => void;
    goTo: (url: string) => void;
    selectedLanguage: string;
}

function Landing(props: Props) {
    const { t } = useTranslation();
    const { selectedLanguage, onLanguageChange, goTo, onContinue } = props;
    const [isTos, setIsTos] = useState(() => {
        const isFlag = localStorage.getItem('isTos');
        return !!isFlag && isFlag === 'true' ? true : false;
    });

    const [isPP, setIsPP] = useState(() => {
        const isFlag = localStorage.getItem('isPP');
        return !!isFlag && isFlag === 'true' ? true : false;
    });

    const [selectedIndex, setSelectedIndex] = useState(() => {
        const index = localStorage.getItem('initIndex');
        if (!index) {
            return 0;
        } else {
            return Number(index);
        }
    });

    function saveData() {
        localStorage.setItem('initIndex', String(selectedIndex));
        localStorage.setItem('isTos', String(isTos));
        localStorage.setItem('isPP', String(isPP));
    }

    function removeData() {
        localStorage.removeItem('initIndex');
        localStorage.removeItem('isTos');
        localStorage.removeItem('isPP');
    }

    function openTermsService() {
        saveData();
        goTo('conditions/termsOfService');
    }
    function openPrivacyPolicy() {
        saveData();
        goTo('conditions/privacyPolicy');
    }

    function gotoMainPage() {
        removeData();
        onContinue();
    }

    function getMainPart(index) {
        switch (index) {
            case 0:
                return (
                    <LanguageContainer>
                        <LanguageSelector locale={selectedLanguage} changeLocale={onLanguageChange} />
                    </LanguageContainer>
                );
            case 1:
                return (
                    <TosContainer>
                        <TosDesTxt>
                            <Trans i18nKey="components.termsModal.description">
                                Before we get started, please read our
                                <Link onClick={openTermsService}> Terms of Service </Link>
                                and
                                <Link onClick={openPrivacyPolicy}> Privacy Policy</Link>
                            </Trans>
                        </TosDesTxt>
                        <FormGroupWrapper>
                            <FormControlLabelWrapper
                                control={<CheckBoxWrapper checked={isTos} onChange={(e) => setIsTos(e.target.checked)} name="checkedB" color="primary" />}
                                label={t('components.landingCarousel.agree_terms').toString()}
                            />
                            <FormControlLabelWrapper
                                control={<CheckBoxWrapper checked={isPP} onChange={(e) => setIsPP(e.target.checked)} name="checkedB" color="primary" />}
                                label={t('components.landingCarousel.agree_policy').toString()}
                            />
                        </FormGroupWrapper>
                    </TosContainer>
                );
            case 2:
                return <ThirdTxt>{t('components.landingCarousel.galleon_access_des')}</ThirdTxt>;
            default:
                return <ThirdTxt>{t('components.landingCarousel.guard_password_des')}</ThirdTxt>;
        }
    }

    function getSlides() {
        return SLIDESLIST.map((index) => {
            return (
                <Container key={index}>
                    <Container1>
                        <WelcomeTxt>{t('components.termsModal.welcome_to', { name })}</WelcomeTxt>
                        {index === 0 && <LangTitle>{t('components.languageSelectModal.select_language')}</LangTitle>}
                        <MainContainer isFirst={index === 0}>
                            <TermsLogo src={termsLogoIcon} />
                            {getMainPart(index)}
                        </MainContainer>
                    </Container1>
                </Container>
            );
        });
    }

    const slides = getSlides();

    const getPrevButton = (onClickHandler, hasPrev) => {
        if (!hasPrev) return null;
        return (
            <ButtonContainer color="secondary" disableRipple={true} onClick={onClickHandler} startIcon={<BackCaret />} isleft={1}>
                {t('general.back')}
            </ButtonContainer>
        );
    };

    const getNextButton = (onClickHandler, hasNext, label) => {
        if (!hasNext) {
            return (
                <StartBtn variant="contained" color="secondary" disableRipple={true} onClick={() => gotoMainPage()}>
                    {t('general.get_started')}
                </StartBtn>
            );
        }
        if (selectedIndex === 1 && (!isTos || !isPP)) {
            return (
                <ButtonContainer color="secondary" disableRipple={true} onClick={onClickHandler} endIcon={<NextCaret />} isleft={0} disabled={true}>
                    {t('general.next')}
                </ButtonContainer>
            );
        }
        return (
            <ButtonContainer color="secondary" disableRipple={true} onClick={onClickHandler} endIcon={<NextCaret />} isleft={0}>
                {t('general.next')}
            </ButtonContainer>
        );
    };

    return (
        <Carousel
            showThumbs={false}
            showArrows={true}
            autoPlay={false}
            showStatus={false}
            useKeyboardArrows={false}
            stopOnHover={false}
            selectedItem={selectedIndex}
            onChange={(e) => setSelectedIndex(e)}
            renderIndicator={(onClickHandler, isSelected, index, label) => <CarouselIndicator key={index} isActive={isSelected} />}
            renderArrowPrev={(onClickHandler, hasPrev, label) => getPrevButton(onClickHandler, hasPrev)}
            renderArrowNext={(onClickHandler, hasNext, label) => getNextButton(onClickHandler, hasNext, label)}
        >
            {slides}
        </Carousel>
    );
}

export default Landing;
