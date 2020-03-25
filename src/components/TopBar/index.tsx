import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { ms } from '../../styles/helpers';
import Logo from '../Logo';
import TezosIcon from '../TezosIcon';
import Button from '../Button';

import { openLink } from '../../utils/general';

import { goHomeAndClearState } from '../../reduxContent/wallet/thunks';

import { helpUrl } from '../../config.json';

const Container = styled.div<{ isExtended?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${ms(0)} ${ms(3)};
  flex-shrink: 0;
  margin-bottom: ${({ isExtended }) => (isExtended ? '50px' : 0)};
`;

const InfoContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: auto;
`;

const Text = styled.span`
  font-size: ${ms(2)};
  font-family: ${({ theme }) => theme.typo.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typo.weights.light};
  color: ${({ theme: { colors } }) => colors.primary};
  padding: 0 ${ms(2)};
  border-right: 1px solid ${({ theme: { colors } }) => colors.gray2};
  letter-spacing: 0.9px;
`;

const ButtonContainer = styled(Button)`
  text-align: center;
  min-width: 57px;
  margin: 0 5px;
  color: ${({ theme: { colors } }) => colors.primary};
  opacity: 0.6;
`;

const ButtonText = styled.div`
  font-size: 10px;
  font-weight: bold;
  letter-spacing: 0.4px;
  line-height: 28px;
  cursor: pointer;
`;
const Icon = styled(TezosIcon)`
  cursor: pointer;
`;

const HelpIcon = styled(TezosIcon)`
  cursor: pointer;
  position: relative;
  top: 2px;
`;

interface Props {
  isLoggedIn: boolean;
  walletName: string;
  isExtended: boolean;
}

const TopBar = (props: Props) => {
  const history = useHistory();
  const { isLoggedIn, walletName, isExtended } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch();

  function logout() {
    dispatch(goHomeAndClearState());
  }

  function goToSettings() {
    history.push('/settings');
  }

  return (
    <Container isExtended={isExtended}>
      <InfoContainer>
        <Logo />
        {isLoggedIn && <Text>{walletName}</Text>}
      </InfoContainer>
      <ButtonContainer onClick={() => openLink(helpUrl)} buttonTheme="plain">
        <HelpIcon size={ms(1.8)} color="primary" iconName="help-outline" />
        <ButtonText>{t('components.settingController.help')}</ButtonText>
      </ButtonContainer>
      <ButtonContainer onClick={() => goToSettings()} buttonTheme="plain">
        <Icon size={ms(2.2)} color="primary" iconName="settings" />
        <ButtonText>{t('components.settingController.settings')}</ButtonText>
      </ButtonContainer>
      {isLoggedIn && (
        <ButtonContainer buttonTheme="plain" onClick={() => logout()}>
          <Icon size={ms(2.2)} color="primary" iconName="logout" />
          <ButtonText>{t('components.settingController.logout')}</ButtonText>
        </ButtonContainer>
      )}
    </Container>
  );
};

export default TopBar;
