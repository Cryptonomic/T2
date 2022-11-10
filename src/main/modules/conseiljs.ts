import { ipcMain } from 'electron';
import { TezosMessageUtils, TezosNodeReader, SignerCurve, TezosParameterFormat, TezosNodeWriter, Signer, KeyStore, TezosConstants } from 'conseiljs';
import { SoftSigner, KeyStoreUtils } from 'conseiljs-softsigner';

ipcMain.handle('conseiljs-tezosmessageutils-readAddress', async (event, hex: string) => {
    return TezosMessageUtils.readAddress(hex);
});

ipcMain.handle('conseiljs-tezosmessageutils-writeAddress', async (event, txt) => {
    return TezosMessageUtils.writeAddress(txt);
});

ipcMain.handle('conseiljs-tezosmessageutils-readKeyWithHint', async (event, b: Buffer | Uint8Array, hint: string) => {
    return TezosMessageUtils.readKeyWithHint(b, hint);
});

ipcMain.handle('conseiljs-tezosmessageutils-readSignatureWithHint', async (event, b: Buffer | Uint8Array, hint: string | SignerCurve) => {
    return TezosMessageUtils.readSignatureWithHint(b, hint);
});

ipcMain.handle('conseiljs-tezosmessageutils-writeKeyWithHint', async (event, txt, pre) => {
    return TezosMessageUtils.writeKeyWithHint(txt, pre);
});

ipcMain.handle('conseiljs-tezosmessageutils-writeBufferWithHint', async (event, txt) => {
    return TezosMessageUtils.writeBufferWithHint(txt);
});

ipcMain.handle('conseiljs-tezosmessageutils-readBufferWithHint', async (event, b: Buffer | Uint8Array, hint?: string) => {
    return TezosMessageUtils.readBufferWithHint(b, hint);
});

ipcMain.handle('conseiljs-tezosmessageutils-writePackedData', async (event, value: string | number | Buffer, type: string, format?: TezosParameterFormat) => {
    return TezosMessageUtils.writePackedData(value, type, format);
});

ipcMain.handle('conseiljs-tezosmessageutils-readPackedData', async (event, hex: string, type: string) => {
    return TezosMessageUtils.readPackedData(hex, type);
});

ipcMain.handle('conseiljs-tezosmessageutils-encodeBigMapKey', async (event, key: Buffer) => {
    return TezosMessageUtils.encodeBigMapKey(key);
});

ipcMain.handle('conseiljs-tezosmessageutils-simpleHash', async (event, payload: Buffer, length: number) => {
    return TezosMessageUtils.simpleHash(payload, length);
});

ipcMain.handle('conseiljs-TezosNodeReader-getContractStorage', async (event, server, address) => {
    const res = await TezosNodeReader.getContractStorage(server, address);
    return res;
});

ipcMain.handle('conseiljs-TezosNodeReader-isImplicitAndEmpty', async (event, server, hash) => {
    const res = await TezosNodeReader.isImplicitAndEmpty(server, hash);
    return res;
});

ipcMain.handle(
    'conseiljs-TezosNodeReader-getValueForBigMapKey',
    async (event, server: string, index: number, key: string, block?: string, chainid?: string) => {
        const res = await TezosNodeReader.getValueForBigMapKey(server, index, key, block, chainid);
        return res;
    }
);

ipcMain.handle('conseiljs-TezosNodeReader-isManagerKeyRevealedForAccount', async (event, server: string, accountHash: string) => {
    const res = await TezosNodeReader.isManagerKeyRevealedForAccount(server, accountHash);
    return res;
});

ipcMain.handle(
    'conseiljs-TezosNodeWriter-sendTransactionOperation',
    async (
        event,
        server: string,
        isLedger: boolean,
        password: string,
        keyStore: KeyStore,
        to: string,
        amount: number,
        fee?: number,
        offset?: number,
        optimizeFee?: boolean
    ) => {
        const newkeyStore = await KeyStoreUtils.restoreIdentityFromSecretKey(keyStore.secretKey);
        const signer = await SoftSigner.createSigner(TezosMessageUtils.writeKeyWithHint(newkeyStore.secretKey, 'edsk'), password);
        console.log('1111111111----', (signer as SoftSigner).getKey());
        const endcoded =
            '98e230e7f1cae4f16ecff2af4c756498158dc95ce233399f5e56a471b4e3fcbd6c007f28708e3db106d493dd509dabc64393206ad53a9e18abfb0ce852f003c094de0f0000f33423d14d19dc0da9325700cfd052840e447fef00';
        const dd = Buffer.from(TezosConstants.OperationGroupWatermark + endcoded, 'hex');
        const op = await signer.signOperation(dd);
        console.log('123123123213213213', op);
        // event.returnValue = await TezosNodeWriter.sendTransactionOperation(server, signer, keyStore, to, amount, fee, offset, optimizeFee);
        event.returnValue = op;
    }
);
