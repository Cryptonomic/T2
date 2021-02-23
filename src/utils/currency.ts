import { BigNumber } from 'bignumber.js';
const utez = 1_000_000;

export function utezToTez(amount: number): number {
    const b = new BigNumber(amount);
    const t = b.dividedBy(new BigNumber(utez));

    return t.toNumber();
}

export function tezToUtez(amount: number | string): number {
    const b = new BigNumber(amount);
    const m = b.multipliedBy(utez);

    return m.toNumber();
}

/**
 * Assumes the input amount to be in µtz. The amount is multiplied by 1_000_000 and then formatted to the requested number of decimal places.
 */
export function formatAmount(amount, decimal: number = 6) {
    const b = new BigNumber(amount);
    const m = b.dividedBy(utez);

    return m.toFixed(decimal);
}
