import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { TezosWalletUtil } from 'conseiljs';
import Snackbar from '@material-ui/core/Snackbar';
import Button from '@material-ui/core/Button';

import CustomTextArea from '../../../components/CustomTextArea';
import TextField from '../../../components/TextField';
import InputAddress from '../../../components/InputAddress';

import { RootState } from '../../../types/store';

import { Container, MainContainer, ButtonContainer, InvokeButton } from './style';

const Verify = () => {
  const { t } = useTranslation();
  const isLoading = useSelector((rootState: RootState) => rootState.app.isLoading);
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [address, setAddress] = useState('');
  const [isAddressIssue, setIsAddressIssue] = useState(false);
  const [result, setResult] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const title = result ? t('general.verbs.match') : t('general.verbs.no_match');

  const isDisabled = isLoading || !message || !signature || !address || isAddressIssue;

  async function onVerify() {
    const isVerified = await TezosWalletUtil.checkSignature(signature, message, address);
    setResult(isVerified);
    setIsOpen(true);
  }

  return (
    <Container>
      <MainContainer>
        <CustomTextArea label={t('general.nouns.message')} onChange={val => setMessage(val)} />
        <TextField label={t('general.nouns.signature')} onChange={val => setSignature(val)} />

        <InputAddress
          label={t('general.nouns.label_address')}
          operationType="send_babylon"
          tooltip={false}
          onChange={val => setAddress(val)}
          onIssue={val => setIsAddressIssue(val)}
        />
      </MainContainer>
      <ButtonContainer>
        <InvokeButton buttonTheme="primary" disabled={isDisabled} onClick={onVerify}>
          {t('general.verbs.verify')}
        </InvokeButton>
      </ButtonContainer>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        message={title}
        action={
          <Button color="secondary" size="small" onClick={() => setIsOpen(false)}>
            {t('general.nouns.ok')}
          </Button>
        }
      />
    </Container>
  );
};

export default Verify;
