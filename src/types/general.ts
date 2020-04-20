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
    Token,
    None,
    STKR,
    TzBTC
}

export interface RegularAddress {
    pkh: string;
    balance: number;
}

export interface AverageFees {
    low: number;
    medium: number;
    high: number;
}

export interface TokenTransaction {
    amount: number;
    block_level: string;
    destination: string;
    fee: number;
    kind: string;
    status: string;
    source: string;
    timestamp: number;
    parameters: string;
    operation_group_hash: string;
}

export enum TokenKind {
    tzip7 = 'tzip7',
    stkr = 'stkr',
    usdtez = 'usdtez',
    tzbtc = 'tzbtc'
}

export interface Token {
    network: string;
    address: string;
    displayName: string;
    symbol: string;
    balance: number;
    mapid?: number;
    administrator?: string;
    transactions: TokenTransaction[];
    activeTab?: string;
    kind: TokenKind;
    icon?: string; // TODO
}

export type BookMark = Account | Token;
