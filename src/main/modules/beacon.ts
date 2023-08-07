import { ipcMain, dialog } from 'electron';
import { sealCryptobox, getHexHash, toHex, generateGUID, getAddressFromPublicKey } from '@airgap/beacon-utils';
import bs58check from 'bs58check';
import { hash } from '@stablelib/blake2b';
import { encode } from '@stablelib/utf8';
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

ipcMain.handle('beacon-getSenderId', async (event, publicKey) => {
    const buffer = Buffer.from(hash(Buffer.from(publicKey, 'hex'), 5));
    const res = bs58check.encode(buffer);
    return res;
});

ipcMain.handle('beacon-getAccountIdentifier', async (event, data) => {
    const buffer = Buffer.from(hash(encode(data.join('-')), 10));
    return bs58check.encode(buffer);
});

ipcMain.handle('beacon-utils-toHex', async (event, data) => {
    return toHex(data);
});
ipcMain.handle('beacon-utils-generateGUID', async (event) => {
    const uid = await generateGUID();
    return uid;
});
ipcMain.handle('beacon-utils-getHexHash', async (event, data) => {
    const res = await getHexHash(data);
    return res;
});
ipcMain.handle('beacon-utils-getAddressFromPublicKey', async (event, data) => {
    const res = await getAddressFromPublicKey(data);
    return res;
});

ipcMain.handle('beacon-core-CommunicationClient-encryptMessageAsymmetric', async (event, recipientPublicKey: string, message: string) => {
    const res = await sealCryptobox(message, Buffer.from(recipientPublicKey, 'hex'));
    return res;
});
