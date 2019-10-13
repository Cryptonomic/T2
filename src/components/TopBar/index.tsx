import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { getWalletName } from '../../reduxContent/wallet/selectors';
// import SettingsController from '../SettingsController/';
import { ms } from '../../styles/helpers';
import Logo from './../Logo';

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

type Props = {
  onlyLogo?: boolean;
  walletName: string;
  isExtended?: boolean;
};

const TopBar = (props: Props) => {
  const { onlyLogo, walletName, isExtended } = props;

  return (
    <Container isExtended={isExtended}>
      <InfoContainer>
        <Logo />
        <Text>{walletName}</Text>
      </InfoContainer>
      {/* <SettingsController onlySettings={onlyLogo} /> */}
    </Container>
  );
};

TopBar.defaultProps = {
  walletName: 'Wallet'
};

const mapStateToProps = (state: any) => ({
  walletName: getWalletName(state)
});

export default connect(
  mapStateToProps,
  null
)(TopBar);
