import { ipcMain, dialog } from 'electron';
import { onGetBeaconClient } from './global';

ipcMain.handle('beacon-init', async (event) => {
    const beaconClient = onGetBeaconClient();
    await beaconClient.init();
    return '';
});

ipcMain.handle('beacon-respond', async (event, res) => {
    const beaconClient = onGetBeaconClient();
    await beaconClient.respond(res);
    return '';
});

ipcMain.handle('beacon-addpeer', async (event, peer) => {
    const beaconClient = onGetBeaconClient();
    try {
        await beaconClient.addPeer(peer);
        return 'success';
    } catch (e) {
        dialog.showMessageBoxSync({ title: 'add peer', message: JSON.stringify(e) });
        return 'failed';
    }
});

ipcMain.handle('beacon-getPermissions', async (event) => {
    const beaconClient = onGetBeaconClient();
    const res = await beaconClient.getPermissions();
    return res;
});

ipcMain.handle('beacon-getAppMetadataList', async (event) => {
    const beaconClient = onGetBeaconClient();
    const res = await beaconClient.getAppMetadataList();
    return res;
});
