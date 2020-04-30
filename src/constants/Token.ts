import { Token, TokenKind } from '../types/general';
import { TRANSACTIONS, DETAILS } from './TabConstants';

import stakerdaoIcon from '../../resources/contracts/stakerdao-icon.png';
import tzbtcIcon from '../../resources/contracts/tzbtc-icon.png';

export const knownTokenContracts: Token[] = [
    {
        network: 'mainnet',
        address: 'KT1EctCuorV2NfVb1XTQgvzJ88MQtWP8cMMv',
        displayName: 'StakerDAO Token',
        symbol: 'STKR',
        balance: 0,
        transactions: [],
        activeTab: DETAILS,
        kind: TokenKind.stkr,
        icon: stakerdaoIcon,
        scale: 0,
        precision: 0,
        round: 0
    },
    {
        network: 'mainnet',
        address: 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn',
        displayName: 'tzBTC',
        symbol: 'tzBTC',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzbtc,
        icon: tzbtcIcon,
        scale: 8,
        precision: 8,
        round: 8
    },
    {
        network: 'carthagenet',
        address: 'KT1HzQofKBxzfiKoMzGbkxBgjis2mWnCtbC2',
        displayName: 'Token Sample',
        symbol: 'TKS',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip7,
        scale: 6,
        precision: 6,
        round: 6
    },
    {
        network: 'carthagenet',
        address: 'KT1Lg8s7Z579xwpDB9aAYPtVeNfQv1QPsSM3',
        displayName: 'Security Exchange Token',
        symbol: 'SECT',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip7,
        scale: 0,
        precision: 0,
        round: 0
    },
    {
        network: 'carthagenet',
        address: 'KT1N3YaxhH3JGr3u9Q7ULd6MnMxYo24jKKDF',
        displayName: 'StakerDAO Token',
        symbol: 'STKR',
        balance: 0,
        transactions: [],
        activeTab: DETAILS,
        kind: TokenKind.stkr,
        icon: stakerdaoIcon,
        scale: 0,
        precision: 0,
        round: 0
    },
    {
        network: 'carthagenet',
        address: 'KT1Ahx2r6V76MLU5owfwZBJCiRpJa7EjL1YM',
        displayName: 'tzBTC',
        symbol: 'tzBTC',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzbtc,
        icon: tzbtcIcon,
        scale: 8,
        precision: 8,
        round: 8
    }
];
