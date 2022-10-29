import { Channels } from 'main/preload';
import { KeyStore, Signer } from 'conseiljs';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        sendMessage(channel: Channels, args: unknown[]): void;
        on(
          channel: Channels,
          func: (...args: unknown[]) => void
        ): (() => void) | undefined;
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
        openDialog: (filters) => Promise<any>,
        saveDialog: (filters) => Promise<any>,
      };
      path: {
        join: (str1, str2) => string;
      };
      fs: {
        writeFile: (filename, wallet) => Promise<any>,
        readFile: (filename: string) => Promise<any>
      }
    };

    conseiljsSoftSigner: {
      KeyStoreUtils: {
        generateMnemonic: (strength?: number) => string,
        generateIdentity: (strength?: number, password?: string, mnemonic?: string) => Promise<KeyStore>,
        restoreIdentityFromSecretKey: (secretKey: string) => Promise<KeyStore>,
        restoreIdentityFromMnemonic: (mnemonic: string, password?: string, pkh?: string, derivationPath?: string, validate?: boolean) => Promise<KeyStore>,
        restoreIdentityFromFundraiser: (mnemonic: string, email: string, password: string, pkh: string) => Promise<KeyStore>,
        generateKeys: (seed: Buffer) => Promise<{
          publicKey: Buffer;
          secretKey: Buffer;
        }>,
        recoverKeys: (secretKey: Buffer) => Promise<{
          publicKey: Buffer;
          secretKey: Buffer;
        }>,
        decryptMessage: (message: Buffer, passphrase: string, salt: Buffer) => Promise<Buffer>,
        encryptMessage: (message: Buffer, passphrase: string, salt: Buffer) => Promise<Buffer>,
        checkTextSignature: (signature: string, message: string, publicKey: string, prehash?: boolean) => Promise<boolean>,
        checkSignature: (signature: string, bytes: Buffer, publicKey: string) => Promise<boolean>
      };
      CryptoUtils: {
        decryptMessage: (message: Buffer, passphrase: string, salt: Buffer) => Promise<string>
      }
      SoftSigner: {
        createSigner: (secretKey: Buffer, password?: string) => Promise<Signer>;
      }
    };
    conseiljsLedgerSigner: {
      KeyStoreUtils: {
        unlockAddress: (derivationPath: string) => Promise<KeyStore>,
        getTezosPublicKey: (derivationPath: string) => Promise<string>
      }
    };
    conseiljs: {
      TezosMessageUtils: {
        writeKeyWithHint: (txt, pre) => any,
        writeBufferWithHint: (txt: string) => any,
        getTezosPublicKey: (derivationPath: string) => Promise<string>
      }
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
