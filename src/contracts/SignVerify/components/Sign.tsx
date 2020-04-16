import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, shallowEqual } from 'react-redux';
import { TezosWalletUtil } from 'conseiljs';
import Button from '@material-ui/core/Button';
import { clipboard } from 'electron';

import CustomTextArea from '../../../components/CustomTextArea';
import { getSelectedKeyStore } from '../../../utils/general';
import { RootState } from '../../../types/store';

import { Container, MainContainer, ButtonContainer, InvokeButton, SnackbarWrapper } from './style';

const Sign = () => {
  const { t } = useTranslation();
  const { isLoading, selectedParentHash, isLedger } = useSelector(
    (rootState: RootState) => rootState.app,
    shallowEqual
  );
  const { identities } = useSelector((rootState: RootState) => rootState.wallet, shallowEqual);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState('');
  const isDisabled = isLoading || !message;

  async function onSign() {
    const keyStore = getSelectedKeyStore(
      identities,
      selectedParentHash,
      selectedParentHash,
      isLedger
    );

    const op = await TezosWalletUtil.signText(keyStore, message);
    setResult(op);
  }

  function copyToClipboard() {
    try {
      clipboard.writeText(result);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <Container>
      <MainContainer>
        <CustomTextArea label={t('general.nouns.message')} onChange={val => setMessage(val)} />
      </MainContainer>
      <ButtonContainer>
        <InvokeButton buttonTheme="primary" disabled={isDisabled} onClick={onSign}>
          {t('general.verbs.sign')}
        </InvokeButton>
      </ButtonContainer>
      <SnackbarWrapper
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={!!result}
        onClose={() => setResult('')}
        message={result}
        action={
          <React.Fragment>
            <Button color="secondary" size="small" onClick={() => copyToClipboard()}>
              {t('general.verbs.copy')}
            </Button>
            <Button color="secondary" size="small" onClick={() => setResult('')}>
              {t('general.nouns.ok')}
            </Button>
          </React.Fragment>
        }
      />
    </Container>
  );
};

export default Sign;
