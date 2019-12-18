import React from 'react';
import styled from 'styled-components';
import { ms } from '../../styles/helpers';
import { logo } from '../../config.json';
const tezosLogo = `../resources/${logo}`;

const Tz = styled.div`
  width: ${ms(7)};
  height: ${ms(7)};
  background-color: ${({ theme: { colors } }) => colors.accent};
  mask: url(${tezosLogo}) no-repeat;
  mask-size: cover;
`;

const Logo = () => <Tz />;

export default Logo;
