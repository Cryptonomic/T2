import { Token, TokenKind } from '../types/general';
import { TRANSACTIONS, DETAILS } from './TabConstants';

import stakerdaoIcon from '../../resources/contracts/stakerdao-icon.png';
import tzbtcIcon from '../../resources/contracts/tzbtc-icon.png';
import usdtzIcon from '../../resources/contracts/usdtz-icon.png';

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
        network: 'mainnet',
        address: 'KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9',
        displayName: 'USDtz',
        symbol: 'USDtz',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip7,
        icon: usdtzIcon,
        scale: 6,
        precision: 6,
        round: 2
    }
];
