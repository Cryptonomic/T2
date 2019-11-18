import React, { useState } from 'react';
import Modal from 'react-modal';
import RootRef from '@material-ui/core/RootRef';

import languageLogoIcon from '../../../resources/imgs/Language_Selection_img.svg';
import localesMap from '../../constants/LocalesMap';

import {
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
import { WithTranslation, withTranslation } from 'react-i18next';

const customStyles = {
  content: {
    alignItems: 'center',
    border: '0',
    borderRadius: '0',
    top: 'auto',
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    left: 0,
    width: '100%'
  },
  overlay: {
    backgroundColor: 'rgba(155, 155, 155, 0.68)'
  }
};

interface OwnProps {
  isOpen: boolean;
  onLanguageChange: (scale: string) => void;
  onContinue: () => void;
  selectedLanguage: string;
}

type Props = OwnProps & WithTranslation;

function LanguageSelectModal(props: Props) {
  let langScrollEl: any = null;
  const { isOpen, onLanguageChange, selectedLanguage, onContinue, t } = props;
  const [isTopFade, setIsTopFade] = useState(false);
  const [numberOfLocales, setNumberOfLocales] = useState(Object.keys(localesMap).length);
  const [isBottomFade, setIsBottomFade] = useState(() => {
    return numberOfLocales >= 6;
  });

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
    <Modal isOpen={isOpen} style={customStyles} ariaHideApp={false}>
      <Container>
        <Title>{t('components.languageSelectModal.choose_language')}</Title>
        <Description>
          {t('components.languageSelectModal.language_selection_description')}
        </Description>
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
                      control={
                        <CustomRadio icon={<NonCheckedCircle />} checkedIcon={<CheckedCircle />} />
                      }
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
    </Modal>
  );
}

export default withTranslation()(LanguageSelectModal);
