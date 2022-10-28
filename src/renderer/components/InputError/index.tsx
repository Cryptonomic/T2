import React from 'react';
import styled from 'styled-components';
import TezosIcon from '../TezosIcon';
import { ms } from '../../styles/helpers';

export const ErrorContainer = styled.div`
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme: { colors } }) => colors.error1};
`;

export const WarningIcon = styled(TezosIcon)`
  padding: 0 ${ms(-9)} 0 0;
  position: relative;
  top: 1px;
`;

interface Props {
  error: string;
}

function InputError(props: Props) {
  const { error } = props;
  return (
    <ErrorContainer>
      <WarningIcon iconName="warning" size={ms(-1)} color="error1" />
      {error}
    </ErrorContainer>
  );
}

export default InputError;
