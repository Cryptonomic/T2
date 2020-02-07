import React from 'react';
import { ms } from '../../../styles/helpers';
import { ErrorContainer, WarningIcon } from './style';

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
