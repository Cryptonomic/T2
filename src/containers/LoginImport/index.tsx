import React, { useState } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { remote } from 'electron';
import path from 'path';
import { withTranslation, WithTranslation } from 'react-i18next';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';

import BackButton from '../../components/BackButton';
import PasswordInput from '../../components/PasswordInput';
import { IMPORT } from '../../constants/CreationTypes';
import { loginThunk } from '../../reduxContent/wallet/thunks';

import { RootState } from '../../types/store';

const CreateContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
`;

const WalletContainers = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 30px;
  min-width: 500px;
`;

export const BackButtonContainer = styled.div`
  margin-bottom: 16px;
`;

const WalletTitle = styled.h3`
  color: #1a325f;
  font-size: 36px;
  font-weight: 300;
  margin: 0 0 1.7rem 0;
`;

const ImportButtonContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0;
  margin-bottom: 1.5rem;
`;

const WalletFileName = styled.span`
  font-size: 15px;
  margin-left: 15px;
  opacity: 0.5;
`;

const SelectBtn = styled(Button)`
  &&& {
    width: 194px;
    border-radius: 20px;
  }
`;

const ActionButton = styled(Fab)`
  &&& {
    margin-top: 39px;
    width: 194px;
  }
`;

interface OwnProps {
  login: (loginType: string, location: string, fileName: string, password: string) => void;
  isLoading: boolean;
}

type Props = WithTranslation & OwnProps;

const dialogFilters = [{ name: 'Tezos Wallet', extensions: ['tezwallet'] }];

function LoginImport(props: Props) {
  const { t, login, isLoading } = props;
  const [walletLocation, setWalletLocation] = useState('');
  const [walletFileName, setWalletFileName] = useState('');
  const [password, setPassword] = useState('');

  function openFile(event) {
    if (event.detail === 0) {
      return;
    }

    const currentWindow = remote.getCurrentWindow();
    remote.dialog.showOpenDialog(
      currentWindow,
      {
        properties: ['openFile'],
        filters: dialogFilters
      },
      filePaths => {
        if (filePaths && filePaths.length) {
          setWalletLocation(path.dirname(filePaths[0]));
          setWalletFileName(path.basename(filePaths[0]));
        }
      }
    );
  }

  async function onLogin(loginType: string) {
    await login(loginType, walletLocation, walletFileName, password);
  }

  function onEnterPress(keyVal: string, disabled: boolean) {
    if (keyVal === 'Enter' && !disabled) {
      onLogin(IMPORT);
    }
  }

  const isDisabled = isLoading || !walletFileName || !password;

  return (
    <CreateContainer onKeyDown={event => onEnterPress(event.key, isDisabled)}>
      <WalletContainers>
        <BackButtonContainer>
          <BackButton label={t('general.back')} />
        </BackButtonContainer>
        <WalletTitle>{t('containers.loginImport.open_wallet_label')}</WalletTitle>
        <ImportButtonContainer>
          <SelectBtn size="small" color="secondary" variant="outlined" onClick={openFile}>
            {t('containers.loginImport.select_file_btn')}
          </SelectBtn>
          <WalletFileName>{walletFileName}</WalletFileName>
        </ImportButtonContainer>
        <PasswordInput
          label={t('general.nouns.wallet_password')}
          password={password}
          changFunc={pwd => setPassword(pwd)}
        />
        <ActionButton
          onClick={() => onLogin(IMPORT)}
          color="secondary"
          variant="extended"
          disabled={isDisabled}
        >
          {t('general.verbs.open')}
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
)(LoginImport) as React.ComponentType<any>;
