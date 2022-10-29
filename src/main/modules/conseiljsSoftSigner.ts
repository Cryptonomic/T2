import { ipcMain } from 'electron';
import { KeyStoreUtils, CryptoUtils, SoftSigner } from 'conseiljs-softsigner';

ipcMain.on('conseiljs-softsigner-generateMnemonic', async (event, val) => {
    event.returnValue = KeyStoreUtils.generateMnemonic(val);
});

ipcMain.on('conseiljs-softsigner-generateIdentity', async (event, strength?: number, password?: string, mnemonic?: string) => {
    const keyStore = await KeyStoreUtils.generateIdentity(strength, password, mnemonic);
    event.returnValue = keyStore;
});

ipcMain.on('conseiljs-softsigner-restoreIdentityFromSecretKey', async (event, secretKey: string) => {
    const keyStore = await KeyStoreUtils.restoreIdentityFromSecretKey(secretKey);
    event.returnValue = keyStore;
});

ipcMain.on('conseiljs-softsigner-restoreIdentityFromMnemonic', async (event, mnemonic: string, password?: string, pkh?: string, derivationPath?: string, validate?: boolean) => {
    const keyStore = await KeyStoreUtils.restoreIdentityFromMnemonic(mnemonic, password, pkh, derivationPath, validate);
    event.returnValue = keyStore;
});

ipcMain.on('conseiljs-softsigner-restoreIdentityFromFundraiser', async (event, mnemonic: string, email: string, password: string, pkh: string) => {
    const keyStore = await KeyStoreUtils.restoreIdentityFromFundraiser(mnemonic, email, password, pkh);
    event.returnValue = keyStore;
});


ipcMain.on('conseiljs-softsigner-generateKeys', async (event, seed: Buffer) => {
    const {publicKey, secretKey} = await KeyStoreUtils.generateKeys(seed);
    event.returnValue = {publicKey, secretKey};
});
ipcMain.on('conseiljs-softsigner-recoverKeys', async (event, secretKey: Buffer) => {
    const val = await KeyStoreUtils.recoverKeys(secretKey);
    event.returnValue = val;
});
ipcMain.on('conseiljs-softsigner-decryptMessage', async (event, message: Buffer, passphrase: string, salt: Buffer) => {
    event.returnValue = await KeyStoreUtils.decryptMessage(message, passphrase, salt)
});
ipcMain.on('conseiljs-softsigner-encryptMessage', async (event, message: Buffer, passphrase: string, salt: Buffer) => {
    event.returnValue = await KeyStoreUtils.encryptMessage(message, passphrase, salt);
});
ipcMain.on('conseiljs-softsigner-checkTextSignature', async (event, signature: string, message: string, publicKey: string, prehash?: boolean) => {
    event.returnValue = await KeyStoreUtils.checkTextSignature(signature, message, publicKey, prehash);
});
ipcMain.on('conseiljs-softsigner-checkSignature', async (event, signature: string, bytes: Buffer, publicKey: string) => {
    event.returnValue = await KeyStoreUtils.checkSignature(signature, bytes, publicKey);
});

ipcMain.on('conseiljs-softsigner-CryptoUtils-generateSaltForPwHash', async (event) => {
    event.returnValue = await CryptoUtils.generateSaltForPwHash();
});

ipcMain.on('conseiljs-softsigner-CryptoUtils-decryptMessage', async (event, message: Buffer, passphrase: string, salt: Buffer) => {
    try {
        const aa = await CryptoUtils.decryptMessage(message, passphrase, salt)
        event.returnValue = aa.toString();
    } catch(e) {
        console.log('111111111', e)
        event.returnValue = e;

    }
    

    // console.log('111111')
    // event.returnValue = await KeyStoreUtils.decryptMessage(message, passphrase, salt).catch(e => {
    //     console.log('22222', e)
    //     return {}
    // });
});

ipcMain.on('conseiljs-softsigner-main-createSigner', async (event, secretKey: Buffer, password?: string) => {
    event.returnValue = await SoftSigner.createSigner(secretKey, password);
});