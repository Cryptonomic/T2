import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import {
    SignerCurve,
    TezosParameterFormat,
    KeyStore,
    ConseilServerInfo,
    StackableOperation,
    Operation,
    TransferPair,
    ConseilQuery,
    OperationKindType,
} from 'conseiljs';
import { SoftSigner } from 'conseiljs-softsigner';

export type Channels = 'showMessage' | 'login' | 'wallet' | 'beacon';

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
            return ipcRenderer.invoke('transportNodeHid-device-lists');
        },
    },
    clipboard: {
        text(text: string) {
            return ipcRenderer.invoke('electron-clipboard', text);
        },
    },
    dialog: {
        openDialog(filters) {
            return ipcRenderer.invoke('electron-dialog-open', filters);
        },
        saveDialog(filters) {
            return ipcRenderer.invoke('electron-dialog-save', filters);
        },
        showMessageBox(title, message) {
            return ipcRenderer.invoke('electron-dialog-show-message', title, message);
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
        fromString(data, type, encoding) {
            return ipcRenderer.sendSync('node-buffer-from-string', data, type, encoding);
        },
        alloc(val: number) {
            return ipcRenderer.invoke('node-buffer-alloc', val);
        },
    },
    fetch(url, options) {
        return ipcRenderer.invoke('electron-fetch', url, options);
    },
    fetchTimeout(url, options) {
        return ipcRenderer.invoke('electron-fetch-timeout', url, options);
    },
    bs58check: {
        decodeToString(val) {
            return ipcRenderer.invoke('bs58check-decode-string', val);
        },
        encodeToString(val) {
            return ipcRenderer.invoke('bs58check-encode-string', val);
        },
    },
    beacon: {
        init() {
            return ipcRenderer.invoke('beacon-init');
        },
        respond(res) {
            return ipcRenderer.invoke('beacon-respond', res);
        },
        addPeer(peer) {
            return ipcRenderer.invoke('beacon-addpeer', peer);
        },
        getPermissions() {
            return ipcRenderer.invoke('beacon-getPermissions');
        },
        getAppMetadataList() {
            return ipcRenderer.invoke('beacon-getAppMetadataList');
        },
        getSenderId(publicKey) {
            return ipcRenderer.invoke('beacon-getSenderId', publicKey);
        },
        getAccountIdentifier(data) {
            return ipcRenderer.invoke('beacon-getAccountIdentifier', data);
        },
        getSignature(isLedger, payload, signingType, password) {
            return ipcRenderer.invoke('beacon-Signature', isLedger, payload, signingType, password);
        },
        utils: {
            toHex(data) {
                return ipcRenderer.invoke('beacon-utils-toHex', data);
            },
            generateGUID() {
                return ipcRenderer.invoke('beacon-utils-generateGUID');
            },
            getHexHash(data) {
                return ipcRenderer.invoke('beacon-utils-getHexHash', data);
            },
            getAddressFromPublicKey(data) {
                return ipcRenderer.invoke('beacon-utils-getAddressFromPublicKey', data);
            },
        },
        core: {
            encryptMessageAsymmetric(recipientPublicKey: string, message: string) {
                return ipcRenderer.invoke('beacon-core-CommunicationClient-encryptMessageAsymmetric', recipientPublicKey, message);
            },
        },
    },
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
        encodeBigMapKey(objectId: string, type: string, encoding?: BufferEncoding) {
            return ipcRenderer.invoke('conseiljs-tezosmessageutils-encodeBigMapKey', objectId, type, encoding);
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
        getMempoolOperationsForAccount(server: string, accountHash: string, chainid?: string) {
            return ipcRenderer.invoke('conseiljs-TezosNodeReader-getMempoolOperationsForAccount', server, accountHash, chainid);
        },
        estimateBranchTimeout(server: string, branch: string, chainid?: string) {
            return ipcRenderer.invoke('conseiljs-TezosNodeReader-estimateBranchTimeout', server, branch, chainid);
        },
        getSpendableBalanceForAccount(server: string, accountHash: string, chainid?: string) {
            return ipcRenderer.invoke('conseiljs-TezosNodeReader-getSpendableBalanceForAccount', server, accountHash, chainid);
        },
        getAccountForBlock(server: string, blockHash: string, accountHash: string, chainid?: string) {
            return ipcRenderer.invoke('conseiljs-TezosNodeReader-getAccountForBlock', server, blockHash, accountHash, chainid);
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
        estimateOperationGroup(server: string, chainid: string, operations: Array<StackableOperation>) {
            return ipcRenderer.invoke('conseiljs-TezosNodeWriter-estimateOperationGroup', server, chainid, operations);
        },
        appendRevealOperation(server: string, publicKey: string, accountHash: string, accountOperationIndex: number, operations: StackableOperation[]) {
            return ipcRenderer.invoke('conseiljs-TezosNodeWriter-appendRevealOperation', server, publicKey, accountHash, accountOperationIndex, operations);
        },
        sendIdentityActivationOperation(server: string, isLedger: boolean, password: string, keyStore: KeyStore, activationCode: string) {
            return ipcRenderer.invoke('conseiljs-TezosNodeWriter-sendIdentityActivationOperation', server, isLedger, password, keyStore, activationCode);
        },
        testContractInvocationOperation(
            server: string,
            chainid: string,
            keyStore: KeyStore,
            contract: string,
            amount: number,
            fee: number,
            storageLimit: number,
            gasLimit: number,
            entrypoint: string | undefined,
            parameters: string | undefined,
            parameterFormat?: TezosParameterFormat
        ) {
            return ipcRenderer.invoke(
                'conseiljs-TezosNodeWriter-testContractInvocationOperation',
                server,
                chainid,
                keyStore,
                contract,
                amount,
                fee,
                storageLimit,
                gasLimit,
                entrypoint,
                parameters,
                parameterFormat
            );
        },
        sendContractOriginationOperation(
            server: string,
            isLedger: boolean,
            password: string,
            keyStore: KeyStore,
            amount: number,
            delegate: string | undefined,
            fee: number,
            storageLimit: number,
            gasLimit: number,
            code: string,
            storage: string,
            codeFormat?: TezosParameterFormat,
            offset?: number,
            optimizeFee?: boolean
        ) {
            return ipcRenderer.invoke(
                'conseiljs-TezosNodeWriter-sendContractOriginationOperation',
                server,
                isLedger,
                password,
                keyStore,
                amount,
                delegate,
                fee,
                storageLimit,
                gasLimit,
                code,
                storage,
                codeFormat,
                offset,
                optimizeFee
            );
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
        deployManagerContract(server: string, isLedger, password, keyStore: KeyStore, delegate: string, fee: number, amount: number, optimizeFee?: boolean) {
            return ipcRenderer.invoke(
                'conseiljs-BabylonDelegationHelper-deployManagerContract',
                server,
                isLedger,
                password,
                keyStore,
                delegate,
                fee,
                amount,
                optimizeFee
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
        getAccountBalance(server: string, mapid: number, account: string) {
            return ipcRenderer.invoke('conseiljs-WrappedTezosHelper-getAccountBalance', server, mapid, account);
        },
        getSimpleStorage(server: string, address: string) {
            return ipcRenderer.invoke('conseiljs-WrappedTezosHelper-getSimpleStorage', server, address);
        },
        listOvens(serverInfo: ConseilServerInfo, coreContractAddress: string, ovenOwner: string, ovenListBigMapId: number) {
            return ipcRenderer.invoke('conseiljs-WrappedTezosHelper-listOvens', serverInfo, coreContractAddress, ovenOwner, ovenListBigMapId);
        },
    },
    TezosConseilClient: {
        awaitOperationConfirmation(serverInfo: ConseilServerInfo, network: string, hash: string, duration?: number, blocktime?: number) {
            return ipcRenderer.invoke('conseiljs-TezosConseilClient-awaitOperationConfirmation', serverInfo, network, hash, duration, blocktime);
        },
        getOperations(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery) {
            return ipcRenderer.invoke('conseiljs-TezosConseilClient-getOperations', serverInfo, network, query);
        },
        getBlockHead(serverInfo: ConseilServerInfo, network: string) {
            return ipcRenderer.invoke('conseiljs-TezosConseilClient-getBlockHead', serverInfo, network);
        },
        getAccount(serverInfo: ConseilServerInfo, network: string, accountID: string) {
            return ipcRenderer.invoke('conseiljs-TezosConseilClient-getAccount', serverInfo, network, accountID);
        },
        countKeysInMap(serverInfo: ConseilServerInfo, mapIndex: number) {
            return ipcRenderer.invoke('conseiljs-TezosConseilClient-countKeysInMap', serverInfo, mapIndex);
        },
        getTezosEntityData(serverInfo: ConseilServerInfo, network: string, entity: string, query: ConseilQuery) {
            return ipcRenderer.invoke('conseiljs-TezosConseilClient-getTezosEntityData', serverInfo, network, entity, query);
        },
        getFeeStatistics(serverInfo: ConseilServerInfo, network: string, operationType: OperationKindType) {
            return ipcRenderer.invoke('conseiljs-TezosConseilClient-getFeeStatistics', serverInfo, network, operationType);
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
        getAccountBalance(server: string, mapid: number, account: string, balancePath?: string) {
            return ipcRenderer.invoke('conseiljs-Tzip7ReferenceTokenHelper-getAccountBalance', server, mapid, account, balancePath);
        },
        getSimpleStorage(server: string, address: string) {
            return ipcRenderer.invoke('conseiljs-Tzip7ReferenceTokenHelper-getSimpleStorage', server, address);
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
        getAccountBalance(server: string, mapid: number, account: string, tokenid: number, balancePath?: string) {
            return ipcRenderer.invoke('conseiljs-MultiAssetTokenHelper-getAccountBalance', server, mapid, account, tokenid, balancePath);
        },
        getSimpleStorage(server: string, address: string) {
            return ipcRenderer.invoke('conseiljs-MultiAssetTokenHelper-getSimpleStorage', server, address);
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
        getAccountBalance(server: string, mapid: number, account: string, balancePath?: string) {
            return ipcRenderer.invoke('conseiljs-SingleAssetTokenHelper-getAccountBalance', server, mapid, account, balancePath);
        },
        getSimpleStorage(server: string, address: string) {
            return ipcRenderer.invoke('conseiljs-SingleAssetTokenHelper-getSimpleStorage', server, address);
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
        getAccountBalance(server: string, mapid: number, account: string) {
            return ipcRenderer.invoke('conseiljs-TzbtcTokenHelper-getAccountBalance', server, mapid, account);
        },
        getTokenSupply(server: string, mapid?: number) {
            return ipcRenderer.invoke('conseiljs-TzbtcTokenHelper-getTokenSupply', server, mapid);
        },
        getPaused(server: string, mapid?: number) {
            return ipcRenderer.invoke('conseiljs-TzbtcTokenHelper-getPaused', server, mapid);
        },
    },
    ConseilDataClient: {
        executeEntityQuery(serverInfo: ConseilServerInfo, platform: string, network: string, entity: string, query: ConseilQuery) {
            return ipcRenderer.invoke('conseiljs-ConseilDataClient-executeEntityQuery', serverInfo, platform, network, entity, query);
        },
    },
    KolibriTokenHelper: {
        getAccountBalance(server: string, mapid: number, account: string) {
            return ipcRenderer.invoke('conseiljs-KolibriTokenHelper-getAccountBalance', server, mapid, account);
        },
        getSimpleStorage(server: string, address: string) {
            return ipcRenderer.invoke('conseiljs-KolibriTokenHelper-getSimpleStorage', server, address);
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
        getKey(password: string) {
            return ipcRenderer.invoke('conseiljs-softsigner-main-getKey', password);
        },
        cloneDecryptedSigner(signer: SoftSigner, password: string) {
            return ipcRenderer.invoke('conseiljs-softsigner-main-cloneDecryptedSigner', signer, password);
        },
        signText(message: string, password: string) {
            return ipcRenderer.invoke('conseiljs-softsigner-main-signText', message, password);
        },
    },
});

contextBridge.exposeInMainWorld('conseiljsLedgerSigner', {
    KeyStoreUtils: {
        unlockAddress(derivationPath: string) {
            return ipcRenderer.invoke('conseiljs-ledgersigner-KeyStoreUtils-unlockAddress', derivationPath);
        },
        getTezosPublicKey(derivationPath: string) {
            return ipcRenderer.invoke('conseiljs-ledgersigner-KeyStoreUtils-getTezosPublicKey', derivationPath);
        },
    },
    LedgerSigner: {
        signText(message: string) {
            return ipcRenderer.invoke('conseiljs-ledgersigner-main-signText', message);
        },
        createSigner(val: string) {
            return ipcRenderer.invoke('conseiljs-ledgersigner-main-createSigner', val);
        },
    },
});
