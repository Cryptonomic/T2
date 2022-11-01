import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// console.log('conseiljsSoftSigner', KeyStoreUtils)

export type Channels = 'ipc-example' | 'showMessage' | 'login' | 'wallet';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  store: {
    get(key) {
      return ipcRenderer.sendSync('electron-store-get', key);
    },
    set(property, val) {
      ipcRenderer.send('electron-store-set', property, val);
    },
    delete(property) {
      ipcRenderer.send('electron-store-delete', property);
    },
    allset(val) {
      ipcRenderer.send('electron-store-all-set', val);
    },
    // Other method you want to add like has(), reset(), etc.
  },
  shell: {
    openExternal(url) {
      ipcRenderer.send('open-enternal-link', url);
    }
  },
  pngJS: {
    get(imageDataBytes) {
      return ipcRenderer.sendSync('electron-pngjs-get', imageDataBytes);
    },
  },
  osPlatform: {
    get() {
      return ipcRenderer.sendSync('os-platform');
    }
  },
  transportNodeHid: {
    getList() {
      return ipcRenderer.sendSync('transportNodeHid-device-lists');
    }
  },
  clipboard: {
    text(text: string) {
      return ipcRenderer.sendSync('electron-clipboard', text);
    }
  },
  dialog: {
    openDialog(filters) {
      return ipcRenderer.sendSync('electron-dialog-open', filters)
    },
    saveDialog(filters) {
      return ipcRenderer.sendSync('electron-dialog-save', filters)
    }
  },
  path: {
    join(str1, str2) {
      return ipcRenderer.sendSync('node-path-join', str1, str2)
    }
  },
  fs: {
    writeFile(filename, wallet) {
      return ipcRenderer.sendSync('node-fs-writeFile', filename, wallet)
    },
    readFile(filename) {
      return ipcRenderer.sendSync('node-fs-readfile', filename)
    }
  }
  // conseiljsSoftSigner: conseiljsSoftSigner
});

contextBridge.exposeInMainWorld('conseiljs', {
  TezosMessageUtils: {
    writeKeyWithHint(txt, pre) {
      return ipcRenderer.sendSync('conseiljs-tezosmessageutils-writeKeyWithHint', txt, pre);
    },
    writeBufferWithHint(txt: string) {
      return ipcRenderer.sendSync('conseiljs-tezosmessageutils-writeBufferWithHint', txt);
    },
  },
  TezosNodeReader: {
    getContractStorage(server, address) {
      return ipcRenderer.sendSync('conseiljs-TezosNodeReader-getContractStorage', server, address);
    }
  }
});

contextBridge.exposeInMainWorld('conseiljsSoftSigner', {
  KeyStoreUtils: {
    generateMnemonic(strength?: number) {
      return ipcRenderer.sendSync('conseiljs-softsigner-generateMnemonic', strength);
    },
    generateIdentity(strength?: number, password?: string, mnemonic?: string) {
      return ipcRenderer.sendSync('conseiljs-softsigner-generateIdentity', strength, password, mnemonic);
    },
    restoreIdentityFromSecretKey(secretKey: string) {
      return ipcRenderer.sendSync('conseiljs-softsigner-restoreIdentityFromSecretKey', secretKey);
    },
    restoreIdentityFromMnemonic(mnemonic: string, password?: string, pkh?: string, derivationPath?: string, validate?: boolean) {
      return ipcRenderer.sendSync('conseiljs-softsigner-restoreIdentityFromMnemonic', mnemonic, password, pkh, derivationPath, validate);
    },
    restoreIdentityFromFundraiser(mnemonic: string, email: string, password: string, pkh: string) {
      return ipcRenderer.sendSync('conseiljs-softsigner-restoreIdentityFromFundraiser', mnemonic, email, password, pkh);
    },
    generateKeys(seed: Buffer) {
      return ipcRenderer.sendSync('conseiljs-softsigner-generateKeys', seed);
    },
    recoverKeys(secretKey: Buffer) {
      return ipcRenderer.sendSync('conseiljs-softsigner-recoverKeys', secretKey);
    },
    decryptMessage(message: Buffer, passphrase: string, salt: Buffer) {
      return ipcRenderer.sendSync('conseiljs-softsigner-decryptMessage', message, passphrase, salt);
    },
    encryptMessage(message: Buffer, passphrase: string, salt: Buffer) {
      return ipcRenderer.sendSync('conseiljs-softsigner-encryptMessage', message, passphrase, salt);
    },
    checkTextSignature(signature: string, message: string, publicKey: string, prehash?: boolean) {
      return ipcRenderer.sendSync('conseiljs-softsigner-checkTextSignature', signature, message, publicKey, prehash);
    },
    checkSignature(signature: string, bytes: Buffer, publicKey: string) {
      return ipcRenderer.sendSync('conseiljs-softsigner-checkSignature', signature, bytes, publicKey);
    }
  },
  CryptoUtils: {
    decryptMessage(message: Buffer, passphrase: string, salt: Buffer) {
      return ipcRenderer.sendSync('conseiljs-softsigner-CryptoUtils-decryptMessage', message, passphrase, salt);
    },
  },
  SoftSigner: {
    createSigner(secretKey: Buffer, password?: string) {
      return ipcRenderer.sendSync('conseiljs-softsigner-main-createSigner', secretKey, password)
    }
  }
});

contextBridge.exposeInMainWorld('conseiljsLedgerSigner', {
  KeyStoreUtils: {
    unlockAddress(derivationPath: string) {
      return ipcRenderer.sendSync('conseiljs-ledgersigner-KeyStoreUtils-unlockAddress', derivationPath);
    },
    getTezosPublicKey(derivationPath: string) {
      return ipcRenderer.sendSync('conseiljs-ledgersigner-KeyStoreUtils-getTezosPublicKey', derivationPath);
    },
  }
});
