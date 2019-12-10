import styled, { css } from 'styled-components';
import Fab from '@material-ui/core/Fab';
import IconButton from '@material-ui/core/IconButton';
import TezosIcon from '../../components/TezosIcon';
import { H4 } from '../../components/Heading';
import { ms } from '../../styles/helpers';

export const Container = styled.div`
  display: flex;
  padding: ${ms(3)} ${ms(4)};
`;

export const SideBarContainer = styled.div`
  width: 30%;
  max-width: 320px;
  flex-shrink: 0;
  padding: 0 ${ms(3)} 0 0;
`;

export const AccountItem = styled.div`
  margin: 0 0 ${ms(1)} 0;
`;
