import { ipcMain } from 'electron';
import { KeyStoreUtils, CryptoUtils, SoftSigner } from 'conseiljs-softsigner';
import { TezosMessageUtils } from 'conseiljs';
import { onGetSigner, onSetSigner, cloneDecryptedSigner } from './global';

ipcMain.handle('conseiljs-softsigner-generateMnemonic', async (event, val) => {
    return KeyStoreUtils.generateMnemonic(val);
});

ipcMain.handle('conseiljs-softsigner-generateIdentity', async (event, strength?: number, password?: string, mnemonic?: string) => {
    const keyStore = await KeyStoreUtils.generateIdentity(strength, password, mnemonic);
    return keyStore;
});

ipcMain.handle('conseiljs-softsigner-restoreIdentityFromSecretKey', async (event, secretKey: string) => {
    const keyStore = await KeyStoreUtils.restoreIdentityFromSecretKey(secretKey);
    return keyStore;
});

ipcMain.handle(
    'conseiljs-softsigner-restoreIdentityFromMnemonic',
    async (event, mnemonic: string, password?: string, pkh?: string, derivationPath?: string, validate?: boolean) => {
        const keyStore = await KeyStoreUtils.restoreIdentityFromMnemonic(mnemonic, password, pkh, derivationPath, validate);
        return keyStore;
    }
);

ipcMain.handle('conseiljs-softsigner-restoreIdentityFromFundraiser', async (event, mnemonic: string, email: string, password: string, pkh: string) => {
    const keyStore = await KeyStoreUtils.restoreIdentityFromFundraiser(mnemonic, email, password, pkh);
    return keyStore;
});

ipcMain.handle('conseiljs-softsigner-generateKeys', async (event, seed: Buffer) => {
    const { publicKey, secretKey } = await KeyStoreUtils.generateKeys(seed);
    return { publicKey, secretKey };
});
ipcMain.handle('conseiljs-softsigner-recoverKeys', async (event, secretKey: Buffer) => {
    const val = await KeyStoreUtils.recoverKeys(secretKey);
    return val;
});
ipcMain.handle('conseiljs-softsigner-decryptMessage', async (event, message: Buffer, passphrase: string, salt: Buffer) => {
    const res = await KeyStoreUtils.decryptMessage(message, passphrase, salt);
    return res;
});
ipcMain.handle('conseiljs-softsigner-encryptMessage', async (event, message: Buffer, passphrase: string, salt: Buffer) => {
    const res = await KeyStoreUtils.encryptMessage(message, passphrase, salt);
    return res;
});
ipcMain.handle('conseiljs-softsigner-checkTextSignature', async (event, signature: string, message: string, publicKey: string, prehash?: boolean) => {
    const res = await KeyStoreUtils.checkTextSignature(signature, message, publicKey, prehash);
    return res;
});
ipcMain.handle('conseiljs-softsigner-checkSignature', async (event, signature: string, bytes: Buffer, publicKey: string) => {
    const res = await KeyStoreUtils.checkSignature(signature, bytes, publicKey);
    return res;
});

ipcMain.handle('conseiljs-softsigner-CryptoUtils-generateSaltForPwHash', async (event) => {
    const res = await CryptoUtils.generateSaltForPwHash();
    return res;
});

ipcMain.handle('conseiljs-softsigner-CryptoUtils-encryptMessage', async (event, message: Buffer, passphrase: string, salt: Buffer) => {
    const res = await CryptoUtils.encryptMessage(message, passphrase, salt);
    return res;
});

ipcMain.handle('conseiljs-softsigner-CryptoUtils-decryptMessage', async (event, message: Buffer, passphrase: string, salt: Buffer) => {
    const res = await CryptoUtils.decryptMessage(message, passphrase, salt);
    return res.toString();
});

ipcMain.handle('conseiljs-softsigner-CryptoUtils-signDetached', async (event, payload: Buffer, secretKey: Buffer) => {
    const res = await CryptoUtils.signDetached(payload, secretKey);
    return res;
});

ipcMain.handle('conseiljs-softsigner-main-createSigner', async (event, secretKey: string, password?: string) => {
    const secBuf = await TezosMessageUtils.writeKeyWithHint(secretKey, 'edsk');
    const res = await SoftSigner.createSigner(secBuf, password);
    onSetSigner(res);
    return res;
});

ipcMain.handle('conseiljs-softsigner-main-getKey', async (event, password: string) => {
    const si = onGetSigner();
    const res = await si.getKey(password);
    return res;
});

ipcMain.handle('conseiljs-softsigner-main-signText', async (event, message: string, password: string) => {
    const si = onGetSigner();
    const signer = await cloneDecryptedSigner(si, password);
    const res = await signer.signText(message);
    return res;
});

// function async getKey(password: string = '', isEncrypted: boolean, secretKey, salt) {
//     if (isEncrypted && password.length > 0) {
//         return await CryptoUtils.decryptMessage(secretKey, password, salt);
//     }

//     return secretKey;
// }

ipcMain.handle('conseiljs-softsigner-main-cloneDecryptedSigner', async (event, signer: SoftSigner, password: string) => {
    const res = await SoftSigner.createSigner(await signer.getKey(password));
    return res;
});
