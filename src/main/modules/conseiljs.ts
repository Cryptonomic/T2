import { ipcMain } from 'electron';
import { TezosMessageUtils, TezosNodeReader, SignerCurve, TezosParameterFormat } from 'conseiljs';

ipcMain.on('conseiljs-tezosmessageutils-readAddress', async (event, hex: string) => {
    event.returnValue = TezosMessageUtils.readAddress(hex);
});

ipcMain.on('conseiljs-tezosmessageutils-writeAddress', async (event, txt) => {
    event.returnValue = TezosMessageUtils.writeAddress(txt);
});

ipcMain.on('conseiljs-tezosmessageutils-readKeyWithHint', async (event, b: Buffer | Uint8Array, hint: string) => {
    event.returnValue = TezosMessageUtils.readKeyWithHint(b, hint);
});

ipcMain.on('conseiljs-tezosmessageutils-readSignatureWithHint', async (event, b: Buffer | Uint8Array, hint: string | SignerCurve) => {
    event.returnValue = TezosMessageUtils.readSignatureWithHint(b, hint);
});

ipcMain.on('conseiljs-tezosmessageutils-writeKeyWithHint', async (event, txt, pre) => {
    event.returnValue = TezosMessageUtils.writeKeyWithHint(txt, pre);
});

ipcMain.on('conseiljs-tezosmessageutils-writeBufferWithHint', async (event, txt) => {
    event.returnValue = TezosMessageUtils.writeBufferWithHint(txt);
});

ipcMain.on('conseiljs-tezosmessageutils-readBufferWithHint', async (event, b: Buffer | Uint8Array, hint?: string) => {
    event.returnValue = TezosMessageUtils.readBufferWithHint(b, hint);
});

ipcMain.on('conseiljs-tezosmessageutils-writePackedData', async (event, value: string | number | Buffer, type: string, format?: TezosParameterFormat) => {
    event.returnValue = TezosMessageUtils.writePackedData(value, type, format);
});

ipcMain.on('conseiljs-tezosmessageutils-readPackedData', async (event, hex: string, type: string) => {
    event.returnValue = TezosMessageUtils.readPackedData(hex, type);
});

ipcMain.on('conseiljs-tezosmessageutils-encodeBigMapKey', async (event, key: Buffer) => {
    event.returnValue = TezosMessageUtils.encodeBigMapKey(key);
});

ipcMain.on('conseiljs-TezosNodeReader-getContractStorage', async (event, server, address) => {
    event.returnValue = await TezosNodeReader.getContractStorage(server, address);
});
