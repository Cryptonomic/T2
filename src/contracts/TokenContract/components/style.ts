import styled from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import TezosIcon from '../../../components/TezosIcon';
import Button from '../../../components/Button';

import { ms } from '../../../styles/helpers';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 0 20px 20px 20px;
  position: relative;
`;

export const AmountContainer = styled.div`
  width: 47%;
  position: relative;
`;

export const FeeContainer = styled.div`
  width: 47%;
  display: flex;
  height: 64px;
`;

export const PasswordButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 71px;
  margin-top: auto;
  width: 100%;
`;

export const InvokeButton = styled(Button)`
  width: 194px;
  height: 50px;
  margin-bottom: 0px;
  margin-left: auto;
  padding: 0;
`;

export const RowContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;
