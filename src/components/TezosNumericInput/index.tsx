import React from 'react';
import styled from 'styled-components';
import TextField from '../TextField';

import TezosIcon from '../TezosIcon';

const TezosIconInput = styled(TezosIcon)`
  position: absolute;
  right: 0px;
  top: 26px;
  display: block;
`;

const NumericInput = styled.div`
  position: relative;
`;

interface Props {
  onChange: (val: string) => void;
  amount: string;
  label: string;
  decimalSeparator: string;
  errorText?: string | React.ReactNode;
}

const TezosNumericInput = (props: Props) => {
  const { amount, label, decimalSeparator, errorText, onChange } = props;

  function validateInput(val) {
    const preventSeparatorAtStart = new RegExp(`^[${decimalSeparator}]`, 'g');
    const allowOnlyNumbers = new RegExp(`[^0-9${decimalSeparator}]`, 'g');
    const allowOnlyOneSeparator = new RegExp(`\\${decimalSeparator}`, 'g');
    let counter = 0;

    let validatedAmount = val
      .replace(preventSeparatorAtStart, '')
      .replace(allowOnlyNumbers, '')
      .replace(allowOnlyOneSeparator, () => {
        counter += 1;
        return counter > 1 ? '' : decimalSeparator;
      });

    const precisionCount = validatedAmount.includes(decimalSeparator)
      ? validatedAmount.split(decimalSeparator)[1].length
      : 0;
    if (precisionCount > 6) {
      const splitedAmount = validatedAmount.split(decimalSeparator);
      const fractional = splitedAmount[1].substring(0, 6);
      validatedAmount = `${splitedAmount[0]}${decimalSeparator}${fractional}`;
    }

    onChange(validatedAmount);
  }
  return (
    <NumericInput>
      <TextField
        label={label}
        value={amount}
        onChange={newVal => validateInput(newVal)}
        type="text"
        errorText={errorText}
      />
      <TezosIconInput color="secondary" iconName="tezos" />
    </NumericInput>
  );
};

export default TezosNumericInput;
