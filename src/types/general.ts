import { StoreType } from 'conseiljs';
export interface Node {
  displayName: string;
  platform: string;
  network: string;
  tezosUrl: string;
  conseilUrl: string;
  apiKey: string;
}

export interface Path {
  label: string;
  derivation: string;
}

export interface NodeStatus {
  tezos: number;
  conseil: number;
}

export interface Account {
  account_id: string;
  balance: number;
  delegate_value?: string;
  script: string;
  storage?: string;
  transactions: any[];
  activeTab?: string;
  status?: string;
  operations: any; // todo type
  order: number;
}

export interface Identity {
  publicKeyHash: string;
  balance: number;
  accounts: Account[];
  publicKey: string;
  privateKey: string;
  operations: any;
  order: number;
  storeType: StoreType;
  activeTab: string;
  status: string;
  transactions: any[]; // todo transaction type
  delegate_value: string;
}

export enum AddressType {
  Manager,
  Smart,
  Delegated,
  None
}

export interface RegularAddress {
  pkh: string;
  balance: number;
}
