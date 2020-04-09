import { Token } from '../types/general';
import { TRANSACTIONS } from './TabConstants';
export const TZIP7 = 'tzip7';

export const tokenRegStrs = {
  tzip7: /Left[(]Left[(]Left[(]Pair"([A-Za-z0-9]*)"[(]Pair"([A-Za-z0-9]*)["]([0-9]*)[))))]/
};

export const knownTokenContracts: Token[] = [
  {
    network: 'carthagenet',
    address: 'KT1HzQofKBxzfiKoMzGbkxBgjis2mWnCtbC2',
    displayName: 'Token Sample',
    symbol: 'TKS',
    balance: 0,
    transactions: [],
    activeTab: TRANSACTIONS,
    kind: TZIP7
  },
  {
    network: 'carthagenet',
    address: 'KT1Lg8s7Z579xwpDB9aAYPtVeNfQv1QPsSM3',
    displayName: 'Security Exchange Token',
    symbol: 'SECT',
    balance: 0,
    transactions: [],
    activeTab: TRANSACTIONS,
    kind: TZIP7
  }
];
