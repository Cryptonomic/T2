import { Channels } from 'main/preload';
import { KeyStore, Signer, SignerCurve, TezosParameterFormat } from 'conseiljs';
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
        };

        conseiljsSoftSigner: {
            KeyStoreUtils: {
                generateMnemonic: (strength?: number) => string;
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
                createSigner: (secretKey: Buffer, password?: string) => Promise<SoftSigner>;
                getKey: (signer: SoftSigner, password?: string) => Promise<Buffer>;
                cloneDecryptedSigner: (signer: SoftSigner, password?: string) => any;
            };
            test: SoftSigner;
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
                getContractStorage: (server, address) => Promise<any>;
                isImplicitAndEmpty: (server, hash) => Promise<boolean>;
                getValueForBigMapKey: (server: string, index: number, key: string, block?: string, chainid?: string) => Promise<any>;
                isManagerKeyRevealedForAccount: (server: string, accountHash: string) => Promise<boolean>;
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
                ) => Promise<any>;
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
