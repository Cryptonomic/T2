import { dialog } from 'electron';
import { Signer } from 'conseiljs';
import { SoftSigner } from 'conseiljs-softsigner';
import { WalletClient } from '@airgap/beacon-sdk';

let globalSigner;
let beaconClient;

export function onGetSigner() {
    return globalSigner;
}

export function onSetSigner(si) {
    globalSigner = si;
}

let mainWindow;

export function onSetMainWindow(wi) {
    mainWindow = wi;
}

export function onGetMainWindow() {
    return mainWindow;
}

export async function cloneDecryptedSigner(signer: SoftSigner, password: string): Promise<Signer> {
    return SoftSigner.createSigner(await signer.getKey(password));
}

export async function onSetBeaconClient() {
    beaconClient = new WalletClient({ name: 'Beacon Wallet Client' });
    await beaconClient.init();
    dialog.showMessageBoxSync({ title: 'init', message: 'success' });
    await beaconClient.connect((message, connection) => {
        dialog.showMessageBoxSync({ title: '111111', message: '2222222' });
        mainWindow.webContents.send('beacon', message, connection);
    });
}

export function onGetBeaconClient() {
    return beaconClient;
}
