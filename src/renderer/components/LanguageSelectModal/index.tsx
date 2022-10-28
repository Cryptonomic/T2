import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
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
    ContinueButton,
} from './style';

const numberOfLocales = Object.keys(localesMap).length;

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onLanguageChange: (scale: string) => void;
    onContinue: () => void;
    selectedLanguage: string;
}

function LanguageSelectModal(props: Props) {
    let langScrollEl: any = null;
    const { isOpen, onLanguageChange, selectedLanguage, onContinue, onClose } = props;
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

    function onModalClose(_event, reason) {
        if (reason !== 'backdropClick') {
            onClose();
        }
    }

    return (
        <Modal open={isOpen} onClose={onModalClose}>
            <ModalContent>
                <Container>
                    <Title>{t('components.languageSelectModal.choose_language')}</Title>
                    <Description>{t('components.languageSelectModal.language_selection_description')}</Description>
                    <MainContainer>
                        <LanguageLogo src={languageLogoIcon} />
                        <GroupContainerWrapper>
                            {isTopFade && <FadeTop />}
                            <RadioGroupContainer
                                ref={setLanguageScrollRef}
                                value={selectedLanguage}
                                onChange={(event) => onLanguageChange(event.target.value)}
                                onScroll={onScrollChange}
                            >
                                {Object.keys(localesMap).map((key) => {
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
