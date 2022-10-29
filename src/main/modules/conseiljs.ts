import { ipcMain } from 'electron';
import { TezosMessageUtils } from 'conseiljs';

ipcMain.on('conseiljs-tezosmessageutils-writeBufferWithHint', async (event, txt) => {
    event.returnValue = TezosMessageUtils.writeBufferWithHint(txt);
});

ipcMain.on('conseiljs-tezosmessageutils-writeKeyWithHint', async (event, txt, pre) => {
    event.returnValue = TezosMessageUtils.writeKeyWithHint(txt, pre);
});
