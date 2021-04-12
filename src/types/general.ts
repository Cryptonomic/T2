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
    TzBTC,
    wXTZ,
    kUSD,
    BLND,
    objkt,
    STKR,
    TokensPage,
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
    usdtz = 'usdtz',
    tzbtc = 'tzbtc',
    wxtz = 'wxtz',
    ethtz = 'ethtz',
    kusd = 'kusd',
    blnd = 'blnd',
    objkt = 'objkt',
    stkr = 'stkr',
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
    helpLink?: string;
}

/**
 * A special token which is generated through locking XTZ in "vaults"
 */
export interface VaultToken extends Token {
    // Address of a contract which can originate Ovens
    vaultCoreAddress: string;

    // ID of a BigMap that contains the Oven Registry
    vaultRegistryMapId: number;

    // A list of Ovens owned by the user.
    vaultList: Vault[];
}

export interface ArtToken extends Token {
    marketAddress: string;
}

/**
 * Data about an Vault.
 */
export interface Vault {
    // TODO(keefertaylor): rename these vars

    /** Contract address of the Oven contract. */
    ovenAddress: string;

    /** Account of the Oven's owner. */
    ovenOwner: string;

    /** Balance of the Oven, in Mutez. */
    ovenBalance: number;

    /** Baker for the oven. */
    baker: string | undefined;
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
