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
}

const NumericInput = (props: Props) => {
    const { symbol, amount, label, errorText, onChange, scale, precision } = props;

    function validateInput(text) {
        onChange(formatAmount(text));
    }

    function formatAmount(v: string): string {
        return new BigNumber(amount)
            .multipliedBy(10 ** scale)
            .toNumber()
            .toFixed(precision);
    }

    return (
        <NumericInputContainer>
            <TextField label={label} value={amount} onChange={t => validateInput(t)} type="number" errorText={errorText} />
            {!symbol ? <TezosIconInput color="secondary" iconName="tezos" /> : <SymbolTxt>{symbol}</SymbolTxt>}
        </NumericInputContainer>
    );
};

export default NumericInput;
