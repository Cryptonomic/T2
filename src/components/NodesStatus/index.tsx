import React from 'react';
import styled from 'styled-components';
import { ms } from '../../styles/helpers';
import TezosIcon from '../TezosIcon/';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${ms(-1)} ${ms(3)};
  background-color: ${({ theme: { colors } }) => colors.error1};
  color: ${({ theme: { colors } }) => colors.white};
  font-size: ${ms(-0.5)};
`;

const WarningIcon = styled(TezosIcon)`
  font-size: ${ms(0.5)};
  margin-right: ${ms(-1.5)};
`;

interface Props {
  message: string;
}

const NodesStatus = (props: Props) => {
  const { message } = props;
  return (
    <Container>
      <WarningIcon color="white" iconName="warning" />
      <span>{message}</span>
    </Container>
  );
};

export default NodesStatus;
