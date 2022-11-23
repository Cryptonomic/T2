import { ipcMain } from 'electron';
import { KeyStoreUtils as KeyStoreUtilsLedger, LedgerSigner, TezosLedgerConnector } from 'conseiljs-ledgersigner';
import { onGetSigner, onSetSigner } from './global';

ipcMain.handle('conseiljs-ledgersigner-KeyStoreUtils-unlockAddress', async (event, derivationPath: string) => {
    const res = await KeyStoreUtilsLedger.unlockAddress(derivationPath);
    return res;
});

ipcMain.handle('conseiljs-ledgersigner-KeyStoreUtils-getTezosPublicKey', async (event, derivationPath: string) => {
    const res = await KeyStoreUtilsLedger.getTezosPublicKey(derivationPath);
    return res;
});

ipcMain.handle('conseiljs-ledgersigner-main-createSigner', async (event, path: string) => {
    const signer = new LedgerSigner(await TezosLedgerConnector.getInstance(), path);
    onSetSigner(signer);
    return signer;
});

ipcMain.handle('conseiljs-ledgersigner-main-signText', async (event, message: string) => {
    const si = onGetSigner();
    const res = await si.signText(message);
    return res;
});
