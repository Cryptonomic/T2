import { BigNumber } from 'bignumber.js';
const utez = 1_000_000;

export function utezToTez(amount: number): number {
    const b = new BigNumber(amount);
    const t = b.dividedBy(new BigNumber(utez));

    return t.toNumber();
}

export function tezToUtez(amount: number | string): number {
    const a = typeof amount === 'string' ? parseFloat(amount) : amount;
    const b = new BigNumber(a);
    const m = b.multipliedBy(utez);

    return m.toNumber();
}

/**
 * Assumes the input amount to be in µtz. The amount is multiplied by 1_000_000 and then formatted to the requested number of decimal places.
 */
export function formatAmount(amount, decimal: number = 6, scale: number = 6, allowNegative = true): string {
    const b = new BigNumber(amount);

    if (!allowNegative && b.isLessThan(0)) {
        return 'invalid';
    }

    const m = b.dividedBy(10 ** scale);

    return m.toFixed(decimal);
}
