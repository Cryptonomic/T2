import React from 'react';
import styled from 'styled-components';
import { ms } from '../../styles/helpers';
import { logo } from '../../config.json';

import tezosLogo from '../../../resources/tezosLogo.svg';

const Tz = styled.img`
  width: ${ms(7)};
  height: ${ms(7)};
`;

const Logo = () => <Tz src={tezosLogo} />;

export default Logo;
