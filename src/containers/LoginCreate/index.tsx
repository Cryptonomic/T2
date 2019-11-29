import React, { useState } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { remote } from 'electron';
import path from 'path';
import zxcvbn from 'zxcvbn';
import { withTranslation, WithTranslation } from 'react-i18next';

import { ms } from '../../styles/helpers';
import { CREATE } from '../../constants/CreationTypes';
import { loginThunk } from '../../reduxContent/wallet/thunks';
import ValidInput from '../../components/ValidInput';
import BackButton from '../../components/BackButton';
import createFileEmptyIcon from '../../../resources/createFileEmpty.svg';

import {
  BackButtonContainer,
  WalletFileName,
  CheckIcon,
  CreateFileSelector,
  CreateContainer,
  WalletContainers,
  WalletTitle,
  WalletDescription,
  ActionButton,
  FormContainer,
  PasswordsContainer,
  CreateFileEmptyIcon,
  CreateFileButton,
  WalletFileSection
} from './style';
import { RootState } from '../../types/store';

interface OwnProps {
  login: (loginType: string, location: string, fileName: string, password: string) => void;
  isLoading: boolean;
}

type Props = WithTranslation & OwnProps;

const dialogFilters = [{ name: 'Tezos Wallet', extensions: ['tezwallet'] }];

function LoginCreate(props: Props) {
  const { t, isLoading, login } = props;
  const [walletLocation, setWalletLocation] = useState('');
  const [walletFileName, setWalletFileName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordValidation, setIsPasswordValidation] = useState(false);
  const [isPwdShowed, setIsPwdShowed] = useState(false);
  const [isPasswordMatched, setIsPasswordMatched] = useState(false);
  const [isConfirmPwdShowed, setIsConfirmPwdShowed] = useState(false);
  const [pwdScore, setPwdScore] = useState(0);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuggestion, setPwdSuggestion] = useState('');
  const [confirmPwdScore, setConfirmPwdScore] = useState(0);
  const [confirmPwdText, setConfirmPwdText] = useState('');

  function saveFile(event) {
    if (event.detail === 0 && walletLocation && walletFileName) {
      return;
    }

    const currentWindow = remote.getCurrentWindow();
    remote.dialog.showSaveDialog(currentWindow, { filters: dialogFilters }, filename => {
      if (filename) {
        setWalletLocation(path.dirname(filename));
        setWalletFileName(path.basename(filename));
      }
    });
  }

  function onChangePassword(pwd: string) {
    if (pwd) {
      const pwdStrength = zxcvbn(pwd);
      const score = pwdStrength.score || 1;
      let error = '';
      if (score < 3) {
        error = t('containers.loginCreate.password_not_strong');
      } else if (score === 3) {
        error = t('containers.loginCreate.you_almost_there');
      } else {
        error = t('containers.loginCreate.you_got_it');
      }

      const isValid = score === 4;
      setPwdScore(score);
      setPwdError(error);
      setIsPasswordValidation(isValid);
      setPassword(pwd);
    } else {
      setPwdScore(0);
      setPwdError('');
      setPwdSuggestion('');
      setIsPasswordValidation(false);
      setPassword(pwd);
    }

    if (confirmPassword && confirmPassword !== password) {
      setIsPasswordMatched(false);
      setConfirmPwdScore(1);
      setConfirmPwdText(t('containers.loginCreate.password_dont_match'));
    } else if (confirmPassword && confirmPassword === password) {
      setIsPasswordMatched(true);
      setConfirmPwdScore(4);
      setConfirmPwdText(t('containers.loginCreate.password_match'));
    }
  }

  function onConfirmPassword(pwd: string) {
    const indexVal = password.indexOf(pwd);
    let score = 0;
    let isMatched = false;
    let confirmStr = '';
    if (password && password === pwd) {
      score = 4;
      isMatched = true;
      confirmStr = t('containers.loginCreate.password_match');
    } else if (password !== confirmPassword && indexVal < 0 && confirmPassword) {
      score = 1;
      isMatched = false;
      confirmStr = t('containers.loginCreate.password_dont_match');
    }
    setIsPasswordMatched(isMatched);
    setConfirmPwdScore(score);
    setConfirmPwdText(confirmStr);
    setConfirmPassword(pwd);
  }

  function onLogin(loginType: string) {
    login(loginType, walletLocation, walletFileName, password);
  }

  function onPasswordShow(index: number) {
    if (index === 1) {
      setIsConfirmPwdShowed(!isConfirmPwdShowed);
    } else {
      setIsPwdShowed(!isPwdShowed);
    }
  }

  function onEnterPress(keyVal: string, disabled: boolean) {
    if (keyVal === 'Enter' && !disabled) {
      onLogin(CREATE);
    }
  }
  function getWalletFileSection() {
    if (walletFileName) {
      return (
        <WalletFileSection>
          <CheckIcon iconName="checkmark2" size={ms(5)} color="check" />
          <WalletFileName>{walletFileName}</WalletFileName>
        </WalletFileSection>
      );
    }

    return <CreateFileEmptyIcon src={createFileEmptyIcon} />;
  }

  const isDisabled = isLoading || !isPasswordValidation || !isPasswordMatched || !walletFileName;

  return (
    <CreateContainer onKeyDown={event => onEnterPress(event.key, isDisabled)}>
      <WalletContainers>
        <BackButtonContainer>
          <BackButton label={t('general.back')} />
        </BackButtonContainer>

        <WalletTitle>{t('containers.loginCreate.create_wallet_title')}</WalletTitle>
        <WalletDescription>
          {t('containers.loginCreate.create_wallet_description')}
        </WalletDescription>
        <FormContainer>
          <CreateFileSelector>
            {getWalletFileSection()}
            <CreateFileButton
              size="small"
              color="secondary"
              variant="outlined"
              onClick={evt => saveFile(evt)}
            >
              {t('containers.loginCreate.create_new_wallet_btn')}
            </CreateFileButton>
          </CreateFileSelector>
          <PasswordsContainer>
            <ValidInput
              label={t('containers.loginCreate.create_wallet_password_label')}
              isShowed={isPwdShowed}
              error={pwdError}
              suggestion={pwdSuggestion}
              score={pwdScore}
              changFunc={onChangePassword}
              onShow={() => onPasswordShow(0)}
            />
            <ValidInput
              label={t('containers.loginCreate.confirm_wallet_password_label')}
              status={true}
              isShowed={isConfirmPwdShowed}
              error={confirmPwdText}
              score={confirmPwdScore}
              changFunc={onConfirmPassword}
              onShow={() => onPasswordShow(1)}
            />
          </PasswordsContainer>
        </FormContainer>
        <ActionButton
          onClick={() => onLogin(CREATE)}
          color="secondary"
          variant="extended"
          disabled={isDisabled}
        >
          {t('containers.loginCreate.create_wallet_btn')}
        </ActionButton>
      </WalletContainers>
    </CreateContainer>
  );
}

const mapStateToProps = (state: RootState) => ({
  isLoading: state.app.isLoading
});

const mapDispatchToProps = dispatch => ({
  login: (loginType: string, location: string, fileName: string, password: string) =>
    dispatch(loginThunk(loginType, location, fileName, password))
});

export default compose(
  withTranslation(),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(LoginCreate) as React.ComponentType<any>;
