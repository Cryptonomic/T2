import { formatAmount, tezToUtez } from '../../src/utils/currency';

describe('currency utils', () => {
    const MILLION = 1000000;

    test('formatAmount', () => {
        let s = formatAmount(MILLION, 2);
        expect(s).toBe('1.00');
        s = formatAmount(3141592);
        expect(s).toBe('3.141592');
        s = formatAmount(0);
        expect(s).toBe('0.000000');
    });

    test('tezToUtez', () => {
        let n = tezToUtez(1);
        expect(n).toBe(MILLION);
        n = tezToUtez('1');
        expect(n).toBe(MILLION);
        n = tezToUtez(1.000001);
        expect(n).toBe(MILLION + 1);
        n = tezToUtez(0);
        expect(n).toBe(0);
    });
});
