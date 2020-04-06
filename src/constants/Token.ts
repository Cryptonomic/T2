import { Token } from '../types/general';
import { TRANSACTIONS } from './TabConstants';

export const knownTokenContracts: Token[] = [
  {
    network: 'carthagenet',
    address: 'KT1HzQofKBxzfiKoMzGbkxBgjis2mWnCtbC2',
    displayName: 'Token Sample',
    symbol: 'TKS',
    balance: 0,
    transactions: [],
    activeTab: TRANSACTIONS
  },
  {
    network: 'carthagenet',
    address: 'KT1Lg8s7Z579xwpDB9aAYPtVeNfQv1QPsSM3',
    displayName: 'Security Exchange Token',
    symbol: 'SECT',
    balance: 0,
    transactions: [],
    activeTab: TRANSACTIONS
  }
];
