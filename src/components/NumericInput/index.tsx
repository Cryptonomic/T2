import React from 'react';

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
    const { symbol, amount, label, errorText, onChange } = props;

    return (
        <NumericInputContainer>
            <TextField label={label} value={amount} onChange={t => onChange(t)} type="number" errorText={errorText} />
            {!symbol ? <TezosIconInput color="secondary" iconName="tezos" /> : <SymbolTxt>{symbol}</SymbolTxt>}
        </NumericInputContainer>
    );
};

export default NumericInput;
