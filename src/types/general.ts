import { KeyStore, KeyStoreType } from 'conseiljs';

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
    operations: any; // TODO: type
    order: number;
}

export interface Identity {
    publicKeyHash: string;
    balance: number;
    accounts: Account[];
    publicKey: string;
    secretKey: string;
    operations: any;
    order: number;
    storeType: KeyStoreType;
    activeTab: string;
    status: string;
    transactions: any[]; // TODO: transaction type
    delegate_value: string;
    derivationPath?: string;
}

export enum AddressType {
    Manager,
    Smart,
    Delegated,
    Token,
    None,
    STKR,
    TzBTC,
    wXTZ,
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

export interface WalletTransaction {
    amount?: number;
    balance?: number;
    block_hash: string;
    block_level: number;
    delegate?: string;
    destination?: string;
    fee?: number;
    gas_limit: number;
    kind: string;
    operation_group_hash: string;
    operation_id: string;
    pkh?: string;
    status: string;
    source?: string;
    storage_limit: number;
    timestamp: Date;
    ttl?: number;
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
    entryPoint?: string;
}

export enum TokenKind {
    tzip7 = 'tzip7',
    stkr = 'stkr',
    usdtez = 'usdtez',
    tzbtc = 'tzbtc',
    wxtz = 'wxtz',
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
    icon?: string;
    details?: any;
    scale?: number;
    precision?: number;
    round?: number;
    transactionFeeFloor?: number;
}

export interface Oven {
    address: string;
    owner: string;
}

export type BookMark = Account | Token;

/**
 * Represents a generic cryptocurrency wallet.
 */
export interface Wallet {
    identities: KeyStore[];
}

/**
 * Represents the first version of an encrypted wallet.
 */
export interface EncryptedWalletVersionOne {
    version: string;
    salt: string;
    ciphertext: string;
    /**
     * Key derivation function
     */
    kdf: string;
}
