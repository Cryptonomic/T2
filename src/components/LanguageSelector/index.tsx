import React, { useState } from 'react';
import i18n from 'i18next';
import RootRef from '@material-ui/core/RootRef';
import Popover from '@material-ui/core/Popover';
import { useTranslation } from 'react-i18next';

import localesMap from '../../constants/LocalesMap';

import {
  ItemWrapper,
  SelectContainer,
  LabelWrapper,
  SelectWrapper,
  SelectContent,
  SelectIcon,
  GroupContainerWrapper,
  ScrollContainer,
  FadeTop,
  FadeBottom
} from './style';

const numberOfLocales = Object.keys(localesMap).length;

interface Props {
  locale: string;
  changeLocale: (locale: string) => void;
}

function LanguageSelector(props: Props) {
  let langScrollEl: any = null;
  const domRef: any = React.useRef();
  const { locale, changeLocale } = props;
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isTopFade, setIsTopFade] = useState(false);
  const [isBottomFade, setIsBottomFade] = useState(() => numberOfLocales >= 6);

  function renderOptions() {
    return Object.keys(localesMap).map(key => {
      return (
        <ItemWrapper
          key={key}
          value={key}
          selected={locale === key}
          onClick={() => onLanguageChange(key)}
        >
          <div> {localesMap[key]} </div>
        </ItemWrapper>
      );
    });
  }

  function setLanguageScrollRef(element) {
    langScrollEl = element;
    if (langScrollEl) {
      const index = Object.keys(localesMap).indexOf(locale);
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

  function onLanguageChange(lang: string) {
    changeLocale(lang);
    i18n.changeLanguage(lang);
    setOpen(false);
  }

  return (
    <SelectContainer>
      <LabelWrapper>{t('general.nouns.language')}</LabelWrapper>
      <RootRef rootRef={domRef}>
        <SelectWrapper onClick={() => setOpen(!open)}>
          <SelectContent>{localesMap[locale]}</SelectContent>
          <SelectIcon />
        </SelectWrapper>
      </RootRef>

      <Popover
        open={open}
        anchorEl={domRef.current}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left'
        }}
        PaperProps={{
          style: {
            width: domRef.current ? domRef.current.clientWidth : 300
          }
        }}
        onClose={() => setOpen(false)}
      >
        <GroupContainerWrapper>
          {isTopFade && <FadeTop />}
          <RootRef rootRef={setLanguageScrollRef}>
            <ScrollContainer onScroll={onScrollChange}>{renderOptions()}</ScrollContainer>
          </RootRef>

          {isBottomFade && <FadeBottom />}
        </GroupContainerWrapper>
      </Popover>
    </SelectContainer>
  );
}

export default LanguageSelector;
