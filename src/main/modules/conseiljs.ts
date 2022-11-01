import { ipcMain } from 'electron';
import { TezosMessageUtils, TezosNodeReader } from 'conseiljs';

ipcMain.on('conseiljs-tezosmessageutils-writeBufferWithHint', async (event, txt) => {
    event.returnValue = TezosMessageUtils.writeBufferWithHint(txt);
});

ipcMain.on('conseiljs-tezosmessageutils-writeKeyWithHint', async (event, txt, pre) => {
    event.returnValue = TezosMessageUtils.writeKeyWithHint(txt, pre);
});

ipcMain.on('conseiljs-TezosNodeReader-getContractStorage', async (event, server, address) => {
    event.returnValue = await TezosNodeReader.getContractStorage(server, address);
});
