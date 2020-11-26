import { BigNumber } from 'bignumber.js';
const utez = 1000000;

export function utezToTez(amount: number): number {
    return amount / utez;
}

export function tezToUtez(amount: number | string): number {
    const x = new BigNumber(amount);
    return x.multipliedBy(utez).toNumber();
}

export function formatAmount(amount, decimal: number = 6) {
    return utezToTez(amount).toFixed(decimal);
}
