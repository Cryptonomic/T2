import React from 'react';
import { BigNumber } from 'bignumber.js';

import TextField from '../TextField';
import { NumericInputContainer, TezosIconInput, SymbolTxt } from './style';

interface Props {
    onChange: (val: string) => void;
    amount: string;
    label: string;
    errorText?: string | React.ReactNode;
    symbol?: string;
    scale: number;
    precision: number;
    maxValue?: number;
    minValue?: number;
    disabled?: boolean;
}

const NumericInput = (props: Props) => {
    const { symbol, amount, label, errorText, onChange, precision, maxValue, minValue, disabled } = props;

    function validateInput(text: string) {
        const b = new BigNumber(text);
        const n = b.toNumber();

        if (minValue !== undefined && minValue > n) {
            // TODO: show error
            return;
        }

        if (maxValue !== undefined && maxValue < n) {
            // TODO: show error
            return;
        }

        onChange(b.toFixed(precision));
    }

    return (
        <NumericInputContainer>
            <TextField
                label={label}
                value={amount}
                onChange={(t) => validateInput(t)}
                type="number"
                errorText={errorText}
                disabled={disabled !== undefined && disabled}
            />
            {!symbol ? <TezosIconInput color="secondary" iconName="tezos" /> : <SymbolTxt>{symbol}</SymbolTxt>}
        </NumericInputContainer>
    );
};

export default NumericInput;
