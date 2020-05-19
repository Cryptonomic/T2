import React, { useState } from 'react';
import Modal from '@material-ui/core/Modal';
import RootRef from '@material-ui/core/RootRef';
import { useTranslation } from 'react-i18next';

import languageLogoIcon from '../../../resources/imgs/Language_Selection_img.svg';
import localesMap from '../../constants/LocalesMap';

import {
    ModalContent,
    Container,
    Title,
    Description,
    MainContainer,
    LanguageLogo,
    GroupContainerWrapper,
    FadeTop,
    FadeBottom,
    RadioGroupContainer,
    FormControlLabelWrapper,
    CustomRadio,
    ButtonContainer,
    CheckedCircle,
    NonCheckedCircle,
    ContinueButton
} from './style';

const numberOfLocales = Object.keys(localesMap).length;

interface Props {
    isOpen: boolean;
    onLanguageChange: (scale: string) => void;
    onContinue: () => void;
    selectedLanguage: string;
}

function LanguageSelectModal(props: Props) {
    let langScrollEl: any = null;
    const { isOpen, onLanguageChange, selectedLanguage, onContinue } = props;
    const { t } = useTranslation();
    const [isTopFade, setIsTopFade] = useState(false);
    const [isBottomFade, setIsBottomFade] = useState(() => numberOfLocales >= 6);

    function setLanguageScrollRef(element) {
        langScrollEl = element;
        if (langScrollEl) {
            const index = Object.keys(localesMap).indexOf(selectedLanguage);
            if (index > 4) {
                langScrollEl.scrollTop = 40 * (index - 4);
            }
        }
    }

    function onScrollChange(event) {
        const pos = event.target.scrollTop;
        const remainCount = numberOfLocales - 5;
        if (pos === 0) {
            setIsTopFade(false);
            setIsBottomFade(true);
        } else if (pos < remainCount * 40) {
            setIsTopFade(true);
            setIsBottomFade(true);
        } else {
            setIsTopFade(true);
            setIsBottomFade(false);
        }
    }

    return (
        <Modal open={isOpen} disableBackdropClick={false}>
            <ModalContent>
                <Container>
                    <Title>{t('components.languageSelectModal.choose_language')}</Title>
                    <Description>{t('components.languageSelectModal.language_selection_description')}</Description>
                    <MainContainer>
                        <LanguageLogo src={languageLogoIcon} />
                        <GroupContainerWrapper>
                            {isTopFade && <FadeTop />}
                            <RootRef rootRef={setLanguageScrollRef}>
                                <RadioGroupContainer
                                    value={selectedLanguage}
                                    onChange={event => onLanguageChange(event.target.value)}
                                    onScroll={onScrollChange}
                                >
                                    {Object.keys(localesMap).map(key => {
                                        return (
                                            <FormControlLabelWrapper
                                                value={key}
                                                key={key}
                                                control={<CustomRadio icon={<NonCheckedCircle />} checkedIcon={<CheckedCircle />} />}
                                                label={localesMap[key]}
                                            />
                                        );
                                    })}
                                </RadioGroupContainer>
                            </RootRef>

                            {isBottomFade && <FadeBottom />}
                        </GroupContainerWrapper>
                    </MainContainer>
                    <ButtonContainer>
                        <ContinueButton buttonTheme="primary" onClick={onContinue}>
                            {t('general.verbs.continue')}
                        </ContinueButton>
                    </ButtonContainer>
                </Container>
            </ModalContent>
        </Modal>
    );
}

export default LanguageSelectModal;
