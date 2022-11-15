import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { SignerCurve, TezosParameterFormat, Signer, KeyStore, ConseilServerInfo, StackableOperation, Operation, TransferPair, ConseilQuery } from 'conseiljs';
import { SoftSigner } from 'conseiljs-softsigner';
import * as fs from 'fs';
import path from 'path';

// console.log('conseiljsSoftSigner', KeyStoreUtils)

export type Channels = 'ipc-example' | 'showMessage' | 'login' | 'wallet';

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        sendMessage(channel: Channels, args: unknown[]) {
            ipcRenderer.send(channel, args);
        },
        on(channel: Channels, func: (...args: unknown[]) => void) {
            const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => func(...args);
            ipcRenderer.on(channel, subscription);

            return () => {
                ipcRenderer.removeListener(channel, subscription);
            };
        },
        once(channel: Channels, func: (...args: unknown[]) => void) {
            ipcRenderer.once(channel, (_event, ...args) => func(...args));
        },
    },
    store: {
        get(key) {
            return ipcRenderer.sendSync('electron-store-get', key);
        },
        set(property, val) {
            ipcRenderer.send('electron-store-set', property, val);
        },
        delete(property) {
            ipcRenderer.send('electron-store-delete', property);
        },
        allset(val) {
            ipcRenderer.send('electron-store-all-set', val);
        },
        // Other method you want to add like has(), reset(), etc.
    },
    shell: {
        openExternal(url) {
            ipcRenderer.send('open-enternal-link', url);
        },
    },
    pngJS: {
        get(imageDataBytes) {
            return ipcRenderer.sendSync('electron-pngjs-get', imageDataBytes);
        },
    },
    osPlatform: {
        get() {
            return ipcRenderer.invoke('os-platform');
        },
    },
    transportNodeHid: {
        getList() {
            return ipcRenderer.sendSync('transportNodeHid-device-lists');
        },
    },
    clipboard: {
        text(text: string) {
            return ipcRenderer.sendSync('electron-clipboard', text);
        },
    },
    dialog: {
        openDialog(filters) {
            return ipcRenderer.invoke('electron-dialog-open', filters);
        },
        saveDialog(filters) {
            return ipcRenderer.invoke('electron-dialog-save', filters);
        },
    },
    path: {
        join(str1, str2) {
            return ipcRenderer.invoke('node-path-join', str1, str2);
        },
    },
    fs: {
        writeFile(filename, wallet) {
            return ipcRenderer.invoke('node-fs-writeFile', filename, wallet);
        },
        readFile(filename) {
            return ipcRenderer.invoke('node-fs-readfile', filename);
        },
    },
    buffer: {
        from(data, encoding) {
            return ipcRenderer.sendSync('node-buffer-from', data, encoding);
        },
        alloc(val: number) {
            return ipcRenderer.invoke('node-buffer-alloc', val);
        },
    },
    // conseiljsSoftSigner: conseiljsSoftSigner
});

contextBridge.exposeInMainWorld('conseiljs', {
    TezosMessageUtils: {
        readAddress(hex: string) {
            return ipcRenderer.invoke('conseiljs-tezosmessageutils-readAddress', hex);
        },
        writeAddress(address: string) {
            return ipcRenderer.invoke('conseiljs-tezosmessageutils-writeAddress', address);
        },
        readKeyWithHint(b: Buffer | Uint8Array, hint: string) {
            return ipcRenderer.invoke('conseiljs-tezosmessageutils-readKeyWithHint', b, hint);
        },
        readSignatureWithHint(b: Buffer | Uint8Array, hint: string | SignerCurve) {
            return ipcRenderer.invoke('conseiljs-tezosmessageutils-readSignatureWithHint', b, hint);
        },
        writeKeyWithHint(txt, pre) {
            return ipcRenderer.invoke('conseiljs-tezosmessageutils-writeKeyWithHint', txt, pre);
        },
        writeBufferWithHint(txt: string) {
            return ipcRenderer.invoke('conseiljs-tezosmessageutils-writeBufferWithHint', txt);
        },
        readBufferWithHint(b: Buffer | Uint8Array, hint?: string) {
            return ipcRenderer.invoke('conseiljs-tezosmessageutils-readBufferWithHint', b, hint);
        },
        writePackedData(value: string | number | Buffer, type: string, format?: TezosParameterFormat) {
            return ipcRenderer.invoke('conseiljs-tezosmessageutils-writePackedData', value, type, format);
        },
        readPackedData(hex: string, type: string) {
            return ipcRenderer.invoke('conseiljs-tezosmessageutils-readPackedData', hex, type);
        },
        encodeBigMapKey(key: Buffer) {
            return ipcRenderer.invoke('conseiljs-tezosmessageutils-encodeBigMapKey', key);
        },
        simpleHash(payload: Buffer, length: number) {
            return ipcRenderer.invoke('conseiljs-tezosmessageutils-simpleHash', payload, length);
        },
    },
    TezosNodeReader: {
        getBlockHead(server) {
            return ipcRenderer.invoke('conseiljs-TezosNodeReader-getBlockHead', server);
        },
        getContractStorage(server, address) {
            return ipcRenderer.invoke('conseiljs-TezosNodeReader-getContractStorage', server, address);
        },
        isImplicitAndEmpty(server, hash) {
            return ipcRenderer.invoke('conseiljs-TezosNodeReader-isImplicitAndEmpty', server, hash);
        },
        getValueForBigMapKey(server: string, index: number, key: string, block?: string, chainid?: string) {
            return ipcRenderer.invoke('conseiljs-TezosNodeReader-getValueForBigMapKey', server, index, key, block, chainid);
        },
        isManagerKeyRevealedForAccount(server: string, accountHash: string) {
            return ipcRenderer.invoke('conseiljs-TezosNodeReader-isManagerKeyRevealedForAccount', server, accountHash);
        },
        getCounterForAccount(server: string, accountHash: string, chainid?: string) {
            return ipcRenderer.invoke('conseiljs-TezosNodeReader-getCounterForAccount', server, accountHash, chainid);
        },
    },
    TezosNodeWriter: {
        sendTransactionOperation(
            server: string,
            isLedger,
            password,
            keyStore: KeyStore,
            to: string,
            amount: number,
            fee?: number,
            offset?: number,
            optimizeFee?: boolean
        ) {
            return ipcRenderer.invoke(
                'conseiljs-TezosNodeWriter-sendTransactionOperation',
                server,
                isLedger,
                password,
                keyStore,
                to,
                amount,
                fee,
                offset,
                optimizeFee
            );
        },
        sendContractInvocationOperation(
            server: string,
            isLedger,
            password,
            keyStore: KeyStore,
            contract: string,
            amount: number,
            fee: number,
            storageLimit: number,
            gasLimit: number,
            entrypoint: string | undefined,
            parameters: string | undefined,
            parameterFormat?: TezosParameterFormat,
            offset?: number,
            optimizeFee?: boolean
        ) {
            return ipcRenderer.invoke(
                'conseiljs-TezosNodeWriter-sendContractInvocationOperation',
                server,
                isLedger,
                password,
                keyStore,
                contract,
                amount,
                fee,
                storageLimit,
                gasLimit,
                entrypoint,
                parameters,
                parameterFormat,
                offset,
                optimizeFee
            );
        },
        constructContractInvocationOperation(
            publicKeyHash: string,
            counter: number,
            to: string,
            amount: number,
            fee: number,
            storageLimit: number,
            gasLimit: number,
            entrypoint: string | undefined,
            parameters: string | undefined,
            parameterFormat?: TezosParameterFormat
        ) {
            return ipcRenderer.invoke(
                'conseiljs-TezosNodeWriter-constructContractInvocationOperation',
                publicKeyHash,
                counter,
                to,
                amount,
                fee,
                storageLimit,
                gasLimit,
                entrypoint,
                parameters,
                parameterFormat
            );
        },
        prepareOperationGroup(server: string, keyStore: KeyStore, counter: number, operations: StackableOperation[], optimizeFee?: boolean) {
            return ipcRenderer.invoke('conseiljs-TezosNodeWriter-prepareOperationGroup', server, keyStore, counter, operations, optimizeFee);
        },
        sendOperation(server: string, operations: Operation[], isLedger: boolean, password: string, offset?: number) {
            return ipcRenderer.invoke('conseiljs-TezosNodeWriter-sendOperation', server, operations, isLedger, password, offset);
        },
    },
    BabylonDelegationHelper: {
        unSetDelegate(server, isLedger, password, keyStore, selectedAccountHash, fee) {
            return ipcRenderer.invoke('conseiljs-BabylonDelegationHelper-unSetDelegate', server, isLedger, password, keyStore, selectedAccountHash, fee);
        },
        setDelegate(server, isLedger, password, keyStore, selectedAccountHash, delegateAddress, fee) {
            return ipcRenderer.invoke(
                'conseiljs-BabylonDelegationHelper-setDelegate',
                server,
                isLedger,
                password,
                keyStore,
                selectedAccountHash,
                delegateAddress,
                fee
            );
        },
        withdrawDelegatedFunds(server, isLedger, password, keyStore: KeyStore, contract: string, fee: number, amount: number) {
            return ipcRenderer.invoke('conseiljs-BabylonDelegationHelper-withdrawDelegatedFunds', server, isLedger, password, keyStore, contract, fee, amount);
        },
        depositDelegatedFunds(server, isLedger, password, keyStore: KeyStore, contract: string, fee: number, amount: number) {
            return ipcRenderer.invoke('conseiljs-BabylonDelegationHelper-depositDelegatedFunds', server, isLedger, password, keyStore, contract, fee, amount);
        },
        sendDelegatedFunds(server, isLedger, password, keyStore: KeyStore, contract: string, fee: number, amount: number, destination: string) {
            return ipcRenderer.invoke(
                'conseiljs-BabylonDelegationHelper-sendDelegatedFunds',
                server,
                isLedger,
                password,
                keyStore,
                contract,
                fee,
                amount,
                destination
            );
        },
    },
    WrappedTezosHelper: {
        transferBalance(
            nodeUrl: string,
            isLedger: boolean,
            password: string,
            keystore: KeyStore,
            tokenContractAddress: string,
            fee: number,
            sourceAddress: string,
            destinationAddress: string,
            amount: number | string,
            gasLimit?: number,
            storageLimit?: number
        ) {
            return ipcRenderer.invoke(
                'conseiljs-WrappedTezosHelper-transferBalance',
                nodeUrl,
                isLedger,
                password,
                keystore,
                tokenContractAddress,
                fee,
                sourceAddress,
                destinationAddress,
                amount,
                gasLimit,
                storageLimit
            );
        },
        deployOven(
            nodeUrl: string,
            isLedger: boolean,
            password: string,
            keystore: KeyStore,
            fee: number,
            coreAddress: string,
            baker?: string | undefined,
            gasLimit?: number,
            storageLimit?: number
        ) {
            return ipcRenderer.invoke(
                'conseiljs-WrappedTezosHelper-deployOven',
                nodeUrl,
                isLedger,
                password,
                keystore,
                fee,
                coreAddress,
                baker,
                gasLimit,
                storageLimit
            );
        },
        depositToOven(
            nodeUrl: string,
            isLedger: boolean,
            password: string,
            keystore: KeyStore,
            ovenAddress: string,
            fee: number,
            amountMutez: number,
            gasLimit?: number,
            storageLimit?: number
        ) {
            return ipcRenderer.invoke(
                'conseiljs-WrappedTezosHelper-depositToOven',
                nodeUrl,
                isLedger,
                password,
                keystore,
                ovenAddress,
                fee,
                amountMutez,
                gasLimit,
                storageLimit
            );
        },
        withdrawFromOven(
            nodeUrl: string,
            isLedger: boolean,
            password: string,
            keystore: KeyStore,
            ovenAddress: string,
            fee: number,
            amountMutez: number,
            gasLimit?: number,
            storageLimit?: number
        ) {
            return ipcRenderer.invoke(
                'conseiljs-WrappedTezosHelper-withdrawFromOven',
                nodeUrl,
                isLedger,
                password,
                keystore,
                ovenAddress,
                fee,
                amountMutez,
                gasLimit,
                storageLimit
            );
        },
        setOvenBaker(
            nodeUrl: string,
            isLedger: boolean,
            password: string,
            keystore: KeyStore,
            fee: number,
            ovenAddress: string,
            bakerAddress: string,
            gasLimit?: number,
            storageLimit?: number
        ) {
            return ipcRenderer.invoke(
                'conseiljs-WrappedTezosHelper-setOvenBaker',
                nodeUrl,
                isLedger,
                password,
                keystore,
                fee,
                ovenAddress,
                bakerAddress,
                gasLimit,
                storageLimit
            );
        },
    },
    TezosConseilClient: {
        awaitOperationConfirmation(serverInfo: ConseilServerInfo, network: string, hash: string, duration?: number, blocktime?: number) {
            return ipcRenderer.invoke('conseiljs-TezosConseilClient-awaitOperationConfirmation', serverInfo, network, hash, duration, blocktime);
        },
        getOperations(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery) {
            return ipcRenderer.invoke('conseiljs-TezosConseilClient-getOperations', serverInfo, network, query);
        },
    },
    Tzip7ReferenceTokenHelper: {
        transferBalance(
            nodeUrl: string,
            isLedger: boolean,
            password: string,
            keystore: KeyStore,
            contract: string,
            fee: number,
            source: string,
            destination: string,
            amount: number,
            gas: number,
            freight: number
        ) {
            return ipcRenderer.invoke(
                'conseiljs-Tzip7ReferenceTokenHelper-transferBalance',
                nodeUrl,
                isLedger,
                password,
                keystore,
                contract,
                fee,
                source,
                destination,
                amount,
                gas,
                freight
            );
        },
        mint(
            server: string,
            isLedger: boolean,
            password: string,
            keystore: KeyStore,
            contract: string,
            fee: number,
            destination: string,
            amount: number,
            gas?: number,
            freight?: number
        ) {
            return ipcRenderer.invoke(
                'conseiljs-Tzip7ReferenceTokenHelper-mint',
                server,
                isLedger,
                password,
                keystore,
                contract,
                fee,
                destination,
                amount,
                gas,
                freight
            );
        },
        burn(
            server: string,
            isLedger: boolean,
            password: string,
            keystore: KeyStore,
            contract: string,
            fee: number,
            source: string,
            amount: number,
            gas: number,
            freight: number
        ) {
            return ipcRenderer.invoke(
                'conseiljs-Tzip7ReferenceTokenHelper-burn',
                server,
                isLedger,
                password,
                keystore,
                contract,
                fee,
                source,
                amount,
                gas,
                freight
            );
        },
    },
    MultiAssetTokenHelper: {
        transfer(
            server: string,
            address: string,
            isLedger: boolean,
            password: string,
            keystore: KeyStore,
            fee: number,
            transfers: TransferPair[],
            gas?: number,
            freight?: number
        ) {
            return ipcRenderer.invoke('conseiljs-MultiAssetTokenHelper-transfer', server, address, isLedger, password, keystore, fee, transfers, gas, freight);
        },
    },
    SingleAssetTokenHelper: {
        transfer(
            server: string,
            address: string,
            isLedger: boolean,
            password: string,
            keystore: KeyStore,
            fee: number,
            source: string,
            transfers: any[],
            gas?: number,
            freight?: number
        ) {
            return ipcRenderer.invoke(
                'conseiljs-SingleAssetTokenHelper-transfer',
                server,
                address,
                isLedger,
                password,
                keystore,
                fee,
                source,
                transfers,
                gas,
                freight
            );
        },
    },
    TzbtcTokenHelper: {
        transferBalance(
            server: string,
            isLedger: boolean,
            password: string,
            keystore: KeyStore,
            contract: string,
            fee: number,
            source: string,
            destination: string,
            amount: number,
            gas?: number,
            freight?: number
        ) {
            return ipcRenderer.invoke(
                'conseiljs-TzbtcTokenHelper-transferBalance',
                server,
                isLedger,
                password,
                keystore,
                contract,
                fee,
                source,
                destination,
                amount,
                gas,
                freight
            );
        },
    },
});

contextBridge.exposeInMainWorld('conseiljsSoftSigner', {
    KeyStoreUtils: {
        generateMnemonic(strength?: number) {
            return ipcRenderer.invoke('conseiljs-softsigner-generateMnemonic', strength);
        },
        generateIdentity(strength?: number, password?: string, mnemonic?: string) {
            return ipcRenderer.invoke('conseiljs-softsigner-generateIdentity', strength, password, mnemonic);
        },
        restoreIdentityFromSecretKey(secretKey: string) {
            return ipcRenderer.invoke('conseiljs-softsigner-restoreIdentityFromSecretKey', secretKey);
        },
        restoreIdentityFromMnemonic(mnemonic: string, password?: string, pkh?: string, derivationPath?: string, validate?: boolean) {
            return ipcRenderer.invoke('conseiljs-softsigner-restoreIdentityFromMnemonic', mnemonic, password, pkh, derivationPath, validate);
        },
        restoreIdentityFromFundraiser(mnemonic: string, email: string, password: string, pkh: string) {
            return ipcRenderer.invoke('conseiljs-softsigner-restoreIdentityFromFundraiser', mnemonic, email, password, pkh);
        },
        generateKeys(seed: Buffer) {
            return ipcRenderer.invoke('conseiljs-softsigner-generateKeys', seed);
        },
        recoverKeys(secretKey: Buffer) {
            return ipcRenderer.invoke('conseiljs-softsigner-recoverKeys', secretKey);
        },
        decryptMessage(message: Buffer, passphrase: string, salt: Buffer) {
            return ipcRenderer.invoke('conseiljs-softsigner-decryptMessage', message, passphrase, salt);
        },
        encryptMessage(message: Buffer, passphrase: string, salt: Buffer) {
            return ipcRenderer.invoke('conseiljs-softsigner-encryptMessage', message, passphrase, salt);
        },
        checkTextSignature(signature: string, message: string, publicKey: string, prehash?: boolean) {
            return ipcRenderer.invoke('conseiljs-softsigner-checkTextSignature', signature, message, publicKey, prehash);
        },
        checkSignature(signature: string, bytes: Buffer, publicKey: string) {
            return ipcRenderer.invoke('conseiljs-softsigner-checkSignature', signature, bytes, publicKey);
        },
    },
    CryptoUtils: {
        generateSaltForPwHash() {
            return ipcRenderer.invoke('conseiljs-softsigner-CryptoUtils-generateSaltForPwHash');
        },
        encryptMessage(message: Buffer, passphrase: string, salt: Buffer) {
            return ipcRenderer.invoke('conseiljs-softsigner-CryptoUtils-encryptMessage', message, passphrase, salt);
        },
        decryptMessage(message: Buffer, passphrase: string, salt: Buffer) {
            return ipcRenderer.invoke('conseiljs-softsigner-CryptoUtils-decryptMessage', message, passphrase, salt);
        },
        signDetached(payload: Buffer, secretKey: Buffer) {
            return ipcRenderer.invoke('conseiljs-softsigner-CryptoUtils-signDetached', payload, secretKey);
        },
    },
    SoftSigner: {
        createSigner(secretKey: string, password?: string) {
            return ipcRenderer.invoke('conseiljs-softsigner-main-createSigner', secretKey, password);
        },
        getKey(signer: SoftSigner, password: string) {
            return ipcRenderer.invoke('conseiljs-softsigner-main-getKey', signer, password);
        },
        cloneDecryptedSigner(signer: SoftSigner, password: string) {
            return ipcRenderer.invoke('conseiljs-softsigner-main-cloneDecryptedSigner', signer, password);
        },
    },
});

contextBridge.exposeInMainWorld('conseiljsLedgerSigner', {
    KeyStoreUtils: {
        unlockAddress(derivationPath: string) {
            return ipcRenderer.sendSync('conseiljs-ledgersigner-KeyStoreUtils-unlockAddress', derivationPath);
        },
        getTezosPublicKey(derivationPath: string) {
            return ipcRenderer.sendSync('conseiljs-ledgersigner-KeyStoreUtils-getTezosPublicKey', derivationPath);
        },
    },
});
