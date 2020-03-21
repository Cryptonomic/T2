import React from 'react';
import styled from 'styled-components';

import { ms } from '../../styles/helpers';
import { logo, logoLink } from '../../config.json';
import { openLink } from '../../utils/general';
import Button from '../Button';

const tezosLogo = '../resources/tezosLogo.svg';
const customLogo = `../resources/${logo}`;

const Tz = styled.div`
  width: ${ms(7)};
  height: ${ms(7)};
  background-color: ${({ theme: { colors } }) => colors.accent};
  mask: url(${tezosLogo}) no-repeat;
  mask-size: cover;
`;

const LogoImg = styled.img`
  max-height: ${ms(7)};
`;

const ButtonContainer = styled(Button)`
  text-align: center;
  min-width: 57px;
  margin: 0 5px;
  color: ${({ theme: { colors } }) => colors.primary};
  opacity: 0.6;
`;

const Logo = () => (
  <ButtonContainer onClick={() => openLink(logoLink)} buttonTheme="plain">
    {logo.length === 0 && <Tz />}
    {logo.length > 0 && <LogoImg src={customLogo} />}
  </ButtonContainer>
);

export default Logo;
