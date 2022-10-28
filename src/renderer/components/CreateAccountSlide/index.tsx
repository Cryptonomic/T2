import React, { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import BackButton from '../../components/BackButton';
import BackUpSeedPhrase from './BackUpSeedPhrase';
import ShowSeedPhrase from './ShowSeedPhrase';
import { GENERATE_MNEMONIC } from '../../constants/AddAddressTypes';
import { generateNewMnemonic } from '../../utils/general';
import useEventListener from '../../customHooks/useEventListener';
import { importAddressThunk } from '../../reduxContent/wallet/thunks';

import {
  CreateAccountSlideContainer,
  BackButtonContainer,
  ActionButton,
  DescriptionContainer,
  TitleContainer
} from './style';

function CreateAccountSlide() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isDisabled, setIsDisabled] = useState(false);
  const [seed, setSeed] = useState(generateNewMnemonic());
  const [currentSlide, setCurrentSlide] = useState(0);

  function updateMnemonic() {
    setSeed(generateNewMnemonic());
  }

  function onImport() {
    dispatch(importAddressThunk(GENERATE_MNEMONIC, seed));
  }

  function onAction() {
    if (currentSlide === 0) {
      setIsDisabled(true);
      setCurrentSlide(currentSlide + 1);
    } else if (currentSlide === 2) {
      onImport();
    } else {
      setCurrentSlide(currentSlide + 1);
    }
  }

  const onKeyPressed = event => {
    if (event.key === 'Enter' && (currentSlide !== 1 || !isDisabled)) {
      onAction();
    }
  };

  const createAccount = () => {
    return (
      <Fragment>
        <TitleContainer>{t('components.createAccountSlide.seed_backup')}</TitleContainer>
        <DescriptionContainer>
          {t('components.createAccountSlide.descriptions.description2')}
        </DescriptionContainer>
      </Fragment>
    );
  };

  function mainRender() {
    switch (currentSlide) {
      case 0:
        return <ShowSeedPhrase seed={seed} onUpdate={() => updateMnemonic()} />;
      case 1:
        return <BackUpSeedPhrase seed={seed} onValid={isVal => setIsDisabled(isVal)} />;
      default:
        return createAccount();
    }
  }

  useEventListener('keydown', onKeyPressed);

  const buttonTitle =
    currentSlide === 2 ? t('components.createAccountSlide.create_account') : t('general.next');

  return (
    <CreateAccountSlideContainer>
      {!!currentSlide && (
        <BackButtonContainer>
          <BackButton
            label={t('components.createAccountSlide.back_to_seed')}
            onClick={() => setCurrentSlide(0)}
          />
        </BackButtonContainer>
      )}
      {mainRender()}
      <ActionButton
        buttonTheme="primary"
        disabled={currentSlide === 1 && isDisabled}
        onClick={() => onAction()}
      >
        {buttonTitle}
      </ActionButton>
    </CreateAccountSlideContainer>
  );
}

export default CreateAccountSlide;
