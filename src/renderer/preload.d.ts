import { Channels } from 'main/preload';
import {
    KeyStore,
    Signer,
    SignerCurve,
    TezosParameterFormat,
    OperationResult,
    OpenOvenResult,
    ConseilServerInfo,
    Transaction,
    StackableOperation,
    Delegation,
    Reveal,
    Operation,
    TransferPair,
    ConseilQuery,
    TezosBlock,
    Contract,
    MultiAssetSimpleStorage,
    WrappedTezosStorage,
} from 'conseiljs';
import { SoftSigner } from 'conseiljs-softsigner';

declare global {
    interface Window {
        electron: {
            ipcRenderer: {
                sendMessage(channel: Channels, args: unknown[]): void;
                on(channel: Channels, func: (...args: unknown[]) => void): (() => void) | undefined;
                once(channel: Channels, func: (...args: unknown[]) => void): void;
            };
            store: {
                get: (key: string) => any;
                set: (key: string, val: any) => void;
                delete: (key: string) => void;
                allset: (val: any) => void;
                // any other methods you've defined...
            };
            shell: {
                openExternal: (url: string) => void;
            };
            clipboard: {
                text: (text: string) => void;
            };
            dialog: {
                openDialog: (filters) => Promise<any>;
                saveDialog: (filters) => Promise<any>;
            };
            path: {
                join: (str1, str2) => string;
            };
            fs: {
                writeFile: (filename, wallet) => Promise<any>;
                readFile: (filename: string) => Promise<any>;
            };
            buffer: {
                from: (data, encoding) => Buffer;
                alloc: (val: number) => Buffer;
            };

            fetch: (url: string, options?) => Promise<any>;
            fetchTimeout: (url: string, options?) => Promise<any>;
        };

        conseiljsSoftSigner: {
            KeyStoreUtils: {
                generateMnemonic: (strength?: number) => Promise<string>;
                generateIdentity: (strength?: number, password?: string, mnemonic?: string) => Promise<KeyStore>;
                restoreIdentityFromSecretKey: (secretKey: string) => Promise<KeyStore>;
                restoreIdentityFromMnemonic: (
                    mnemonic: string,
                    password?: string,
                    pkh?: string,
                    derivationPath?: string,
                    validate?: boolean
                ) => Promise<KeyStore>;
                restoreIdentityFromFundraiser: (mnemonic: string, email: string, password: string, pkh: string) => Promise<KeyStore>;
                generateKeys: (seed: Buffer) => Promise<{
                    publicKey: Buffer;
                    secretKey: Buffer;
                }>;
                recoverKeys: (secretKey: Buffer) => Promise<{
                    publicKey: Buffer;
                    secretKey: Buffer;
                }>;
                decryptMessage: (message: Buffer, passphrase: string, salt: Buffer) => Promise<Buffer>;
                encryptMessage: (message: Buffer, passphrase: string, salt: Buffer) => Promise<Buffer>;
                checkTextSignature: (signature: string, message: string, publicKey: string, prehash?: boolean) => Promise<boolean>;
                checkSignature: (signature: string, bytes: Buffer, publicKey: string) => Promise<boolean>;
            };
            CryptoUtils: {
                generateSaltForPwHash: () => Promise<Buffer>;
                decryptMessage: (message: Buffer, passphrase: string, salt: Buffer) => Promise<string>;
                encryptMessage: (message: Buffer, passphrase: string, salt: Buffer) => Promise<Buffer>;
                signDetached: (payload: Buffer, secretKey: Buffer) => Promise<Buffer>;
            };
            SoftSigner: {
                createSigner: (secretKey: string, password?: string) => void;
                getKey: (signer: SoftSigner, password?: string) => Promise<Buffer>;
                cloneDecryptedSigner: (signer: SoftSigner, password?: string) => any;
            };
        };
        conseiljsLedgerSigner: {
            KeyStoreUtils: {
                unlockAddress: (derivationPath: string) => Promise<KeyStore>;
                getTezosPublicKey: (derivationPath: string) => Promise<string>;
            };
        };
        conseiljs: {
            TezosMessageUtils: {
                readAddress: (hex: string) => string;
                writeAddress: (address: string) => string;
                readKeyWithHint: (b: Buffer | Uint8Array, hint: string) => string;
                writeKeyWithHint: (txt, pre) => any;
                readSignatureWithHint: (b: Buffer | Uint8Array, hint: string | SignerCurve) => string;
                writeBufferWithHint: (txt: string) => any;
                readBufferWithHint: (b: Buffer | Uint8Array, hint?: string) => string;
                writePackedData: (value: string | number | Buffer, type: string, format?: TezosParameterFormat) => string;
                readPackedData: (hex: string, type: string) => string | number;
                encodeBigMapKey: (key: Buffer) => string;
                simpleHash: (payload: Buffer, length: number) => Buffer;
            };
            TezosNodeReader: {
                getBlockHead: (server: string) => Promise<TezosBlock>;
                getContractStorage: (server, address) => Promise<any>;
                isImplicitAndEmpty: (server, hash) => Promise<boolean>;
                getValueForBigMapKey: (server: string, index: number, key: string, block?: string, chainid?: string) => Promise<any>;
                isManagerKeyRevealedForAccount: (server: string, accountHash: string) => Promise<boolean>;
                getCounterForAccount: (server: string, accountHash: string, chainid?: string) => Promise<number>;
                getMempoolOperationsForAccount: (server: string, accountHash: string, chainid?: string) => Promise<any>;
                estimateBranchTimeout: (server: string, branch: string, chainid?: string) => Promise<number>;
                getSpendableBalanceForAccount: (server: string, accountHash: string, chainid?: string) => Promise<number>;
                getAccountForBlock: (server: string, blockHash: string, accountHash: string, chainid?: string) => Promise<Contract>;
            };
            TezosNodeWriter: {
                sendTransactionOperation: (
                    server: string,
                    isLedger: boolean,
                    password: string,
                    keyStore: KeyStore,
                    to: string,
                    amount: number,
                    fee?: number,
                    offset?: number,
                    optimizeFee?: boolean
                ) => Promise<OperationResult>;
                sendContractInvocationOperation: (
                    server: string,
                    isLedger: boolean,
                    password: string,
                    keyStore: KeyStore,
                    contract: string,
                    amount: number,
                    fee: number,
                    storageLimit: number,
                    gasLimit: number,
                    entrypoint: string | undefined,
                    parameters: string | undefined,
                    parameterFormat?: TezosParameterFormat,
                    offset?: number,
                    optimizeFee?: boolean
                ) => Promise<OperationResult>;
                constructContractInvocationOperation: (
                    publicKeyHash: string,
                    counter: number,
                    to: string,
                    amount: number,
                    fee: number,
                    storageLimit: number,
                    gasLimit: number,
                    entrypoint: string | undefined,
                    parameters: string | undefined,
                    parameterFormat?: TezosParameterFormat
                ) => Transaction;
                prepareOperationGroup: (
                    server: string,
                    keyStore: KeyStore,
                    counter: number,
                    operations: StackableOperation[],
                    optimizeFee?: boolean
                ) => Promise<(Transaction | Delegation | Reveal)[]>;
                sendOperation(server: string, operations: Operation[], isLedger: boolean, password: string, offset?: number): Promise<OperationResult>;
                estimateOperationGroup: (server: string, chainid: string, operations: Array<StackableOperation>) => Promise<any>;
                appendRevealOperation: (
                    server: string,
                    publicKey: string,
                    accountHash: string,
                    accountOperationIndex: number,
                    operations: StackableOperation[]
                ) => Promise<(Transaction | Delegation | Reveal)[]>;
                sendIdentityActivationOperation(
                    server: string,
                    isLedger: boolean,
                    password: string,
                    keyStore: KeyStore,
                    activationCode: string
                ): Promise<OperationResult>;
                testContractInvocationOperation: (
                    server: string,
                    chainid: string,
                    keyStore: KeyStore,
                    contract: string,
                    amount: number,
                    fee: number,
                    storageLimit: number,
                    gasLimit: number,
                    entrypoint: string | undefined,
                    parameters: string | undefined,
                    parameterFormat?: TezosParameterFormat
                ) => Promise<{
                    gas: number;
                    storageCost: number;
                    estimatedFee: number;
                    estimatedStorageBurn: number;
                }>;
            };
            BabylonDelegationHelper: {
                unSetDelegate: (
                    server: string,
                    isLedger: boolean,
                    password: string,
                    keyStore: KeyStore,
                    contract: string,
                    fee: number
                ) => Promise<OperationResult>;
                setDelegate: (
                    server: string,
                    isLedger: boolean,
                    password: string,
                    keyStore: KeyStore,
                    contract: string,
                    delegate: string,
                    fee: number
                ) => Promise<OperationResult>;
                withdrawDelegatedFunds: (
                    server: string,
                    isLedger: boolean,
                    password: string,
                    keyStore: KeyStore,
                    contract: string,
                    fee: number,
                    amount: number
                ) => Promise<OperationResult>;
                depositDelegatedFunds(
                    server: string,
                    isLedger: boolean,
                    password: string,
                    keyStore: KeyStore,
                    contract: string,
                    fee: number,
                    amount: number
                ): Promise<OperationResult>;
                sendDelegatedFunds(
                    server: string,
                    isLedger: boolean,
                    password: string,
                    keyStore: KeyStore,
                    contract: string,
                    fee: number,
                    amount: number,
                    destination: string
                ): Promise<OperationResult>;
            };
            WrappedTezosHelper: {
                transferBalance(
                    nodeUrl: string,
                    isLedger: boolean,
                    password: string,
                    keystore: KeyStore,
                    tokenContractAddress: string,
                    fee: number,
                    sourceAddress: string,
                    destinationAddress: string,
                    amount: number | string,
                    gasLimit?: number,
                    storageLimit?: number
                ): Promise<string>;
                deployOven: (
                    nodeUrl: string,
                    isLedger: boolean,
                    password: string,
                    keystore: KeyStore,
                    fee: number,
                    coreAddress: string,
                    baker?: string | undefined,
                    gasLimit?: number,
                    storageLimit?: number
                ) => Promise<OpenOvenResult>;
                depositToOven: (
                    nodeUrl: string,
                    isLedger: boolean,
                    password: string,
                    keystore: KeyStore,
                    ovenAddress: string,
                    fee: number,
                    amountMutez: number,
                    gasLimit?: number,
                    storageLimit?: number
                ) => Promise<string>;
                withdrawFromOven(
                    nodeUrl: string,
                    isLedger: boolean,
                    password: string,
                    keystore: KeyStore,
                    ovenAddress: string,
                    fee: number,
                    amountMutez: number,
                    gasLimit?: number,
                    storageLimit?: number
                ): Promise<string>;
                setOvenBaker: (
                    nodeUrl: string,
                    isLedger: boolean,
                    password: string,
                    keystore: KeyStore,
                    fee: number,
                    ovenAddress: string,
                    bakerAddress: string,
                    gasLimit?: number,
                    storageLimit?: number
                ) => Promise<string>;
                getAccountBalance: (server: string, mapid: number, account: string) => Promise<number>;
                getSimpleStorage: (server: string, address: string) => Promise<WrappedTezosStorage>;
                listOvens: (serverInfo: ConseilServerInfo, coreContractAddress: string, ovenOwner: string, ovenListBigMapId: number) => Promise<Array<string>>;
            };
            TezosConseilClient: {
                awaitOperationConfirmation: (
                    serverInfo: ConseilServerInfo,
                    network: string,
                    hash: string,
                    duration?: number,
                    blocktime?: number
                ) => Promise<any>;
                getOperations: (serverInfo: ConseilServerInfo, network: string, query: ConseilQuery) => Promise<any[]>;
                getBlockHead: (serverInfo: ConseilServerInfo, network: string) => Promise<any>;
                getAccount: (serverInfo: ConseilServerInfo, network: string, accountID: string) => Promise<any>;
                countKeysInMap: (serverInfo: ConseilServerInfo, mapIndex: number) => Promise<number>;
            };
            Tzip7ReferenceTokenHelper: {
                transferBalance: (
                    server: string,
                    isLedger: boolean,
                    password: string,
                    keystore: KeyStore,
                    contract: string,
                    fee: number,
                    source: string,
                    destination: string,
                    amount: number,
                    gas: number,
                    freight: number
                ) => Promise<string>;
                mint: (
                    server: string,
                    isLedger: boolean,
                    password: string,
                    keystore: KeyStore,
                    contract: string,
                    fee: number,
                    destination: string,
                    amount: number,
                    gas?: number,
                    freight?: number
                ) => Promise<string>;
                burn: (
                    server: string,
                    isLedger: boolean,
                    password: string,
                    keystore: KeyStore,
                    contract: string,
                    fee: number,
                    source: string,
                    amount: number,
                    gas: number,
                    freight: number
                ) => Promise<string>;
                getAccountBalance: (server: string, mapid: number, account: string, balancePath?: string) => Promise<number>;
                getSimpleStorage: (
                    server: string,
                    address: string
                ) => Promise<{
                    mapid: number;
                    supply: number;
                    administrator: string;
                    paused: boolean;
                }>;
            };
            MultiAssetTokenHelper: {
                transfer(
                    server: string,
                    address: string,
                    isLedger: boolean,
                    password: string,
                    keystore: KeyStore,
                    fee: number,
                    transfers: TransferPair[],
                    gas?: number,
                    freight?: number
                ): Promise<string>;
                getAccountBalance: (server: string, mapid: number, account: string, tokenid: number, balancePath?: string) => Promise<number>;
                getSimpleStorage: (server: string, address: string) => Promise<MultiAssetSimpleStorage>;
            };
            SingleAssetTokenHelper: {
                transfer(
                    server: string,
                    address: string,
                    isLedger: boolean,
                    password: string,
                    keystore: KeyStore,
                    fee: number,
                    source: string,
                    transfers: any[],
                    gas?: number,
                    freight?: number
                ): Promise<string>;
                getAccountBalance: (server: string, mapid: number, account: string, balancePath?: string) => Promise<number>;
                getSimpleStorage: (
                    server: string,
                    address: string
                ) => Promise<{
                    mapid: number;
                    supply: number;
                    administrator: string;
                    paused: boolean;
                }>;
            };
            TzbtcTokenHelper: {
                transferBalance: (
                    server: string,
                    isLedger: boolean,
                    password: string,
                    keystore: KeyStore,
                    contract: string,
                    fee: number,
                    source: string,
                    destination: string,
                    amount: number,
                    gas?: number,
                    freight?: number
                ) => Promise<string>;
                getAccountBalance: (server: string, mapid: number, account: string) => Promise<number>;
                getTokenSupply: (server: string, mapid?: number) => Promise<number>;
                getPaused: (server: string, mapid?: number) => Promise<boolean>;
            };
            ConseilDataClient: {
                executeEntityQuery: (serverInfo: ConseilServerInfo, platform: string, network: string, entity: string, query: ConseilQuery) => Promise<any[]>;
            };
            KolibriTokenHelper: {
                getAccountBalance: (server: string, mapid: number, account: string) => Promise<number>;
                getSimpleStorage: (
                    server: string,
                    address: string
                ) => Promise<{
                    mapid: number;
                    supply: number;
                    administrator: string;
                    paused: boolean;
                }>;
            };
        };
        pngJS: {
            get: (imageDataBytes) => any;
        };
        osPlatform: {
            get: () => string;
        };
        transportNodeHid: {
            getList: () => Promise<any[]>;
        };
    }
}

export {};
