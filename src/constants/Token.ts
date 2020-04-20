import { Token, TokenKind } from '../types/general';
import { TRANSACTIONS } from './TabConstants';

export const tokenRegStrs = {
    tzip7: /Left[(]Left[(]Left[(]Pair"([A-Za-z0-9]*)"[(]Pair"([A-Za-z0-9]*)["]([0-9]*)[))))]/ // TODO
};

export const knownTokenContracts: Token[] = [
    {
        network: 'mainnet',
        address: 'KT1EctCuorV2NfVb1XTQgvzJ88MQtWP8cMMv',
        displayName: 'StakerDAO Token',
        symbol: 'STKR',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.stkr
    },
    {
        network: 'mainnet',
        address: 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn',
        displayName: 'tzBTC',
        symbol: 'tzBTC',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzbtc
    },
    {
        network: 'carthagenet',
        address: 'KT1HzQofKBxzfiKoMzGbkxBgjis2mWnCtbC2',
        displayName: 'Token Sample',
        symbol: 'TKS',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip7
    },
    {
        network: 'carthagenet',
        address: 'KT1Lg8s7Z579xwpDB9aAYPtVeNfQv1QPsSM3',
        displayName: 'Security Exchange Token',
        symbol: 'SECT',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip7
    },
    {
        network: 'carthagenet',
        address: 'KT1N3YaxhH3JGr3u9Q7ULd6MnMxYo24jKKDF',
        displayName: 'StakerDAO Token',
        symbol: 'STKR',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.stkr
    },
    {
        network: 'carthagenet',
        address: 'KT1Ahx2r6V76MLU5owfwZBJCiRpJa7EjL1YM',
        displayName: 'tzBTC',
        symbol: 'tzBTC',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzbtc
    }
];
