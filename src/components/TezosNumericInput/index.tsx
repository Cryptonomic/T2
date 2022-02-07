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

const SymbolTxt = styled.span`
    position: absolute;
    right: 0px;
    top: 24px;
    font-size: 14px;
    color: ${({ theme: { colors } }) => colors.primary};
    font-weight: 500;
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
    symbol?: string;
    disabled?: boolean;
    readOnly?: boolean;
}

const TezosNumericInput = (props: Props) => {
    const { symbol, amount, label, decimalSeparator, errorText, onChange, disabled, readOnly } = props;

    function validateInput(val) {
        const preventSeparatorAtStart = new RegExp(`^[${decimalSeparator}]`, 'g');
        const allowOnlyNumbers = new RegExp(`[^0-9${decimalSeparator}]`, 'g');
        const allowOnlyOneSeparator = new RegExp(`\\${decimalSeparator}`, 'g');
        let counter = 0;

        let validatedAmount = val.replace(allowOnlyNumbers, '').replace(allowOnlyOneSeparator, () => {
            counter += 1;
            return counter > 1 ? '' : decimalSeparator;
        });

        if (preventSeparatorAtStart.test(validatedAmount)) {
            validatedAmount = '0' + validatedAmount;
        }

        const precisionCount = validatedAmount.includes(decimalSeparator) ? validatedAmount.split(decimalSeparator)[1].length : 0;
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
                disabled={disabled}
                onChange={(newVal) => validateInput(newVal)}
                type="text"
                errorText={errorText}
                readOnly={readOnly}
            />
            {!symbol ? <TezosIconInput color="secondary" iconName="tezos" /> : <SymbolTxt>{symbol}</SymbolTxt>}
        </NumericInput>
    );
};

export default TezosNumericInput;
