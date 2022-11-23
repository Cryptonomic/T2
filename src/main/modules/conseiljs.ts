import { ipcMain } from 'electron';
import {
    TezosMessageUtils,
    TezosNodeReader,
    SignerCurve,
    TezosParameterFormat,
    TezosNodeWriter,
    Signer,
    KeyStore,
    TezosConstants,
    BabylonDelegationHelper,
    WrappedTezosHelper,
    TezosConseilClient,
    ConseilServerInfo,
    StackableOperation,
    Operation,
    Tzip7ReferenceTokenHelper,
    MultiAssetTokenHelper,
    TransferPair,
    SingleAssetTokenHelper,
    ConseilQuery,
    TzbtcTokenHelper,
    ConseilDataClient,
    KolibriTokenHelper,
    OperationKindType,
} from 'conseiljs';
import { SoftSigner, KeyStoreUtils } from 'conseiljs-softsigner';
import { onGetSigner, cloneDecryptedSigner } from './global';

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

ipcMain.handle('conseiljs-tezosmessageutils-encodeBigMapKey', async (event, value: string | number | Buffer, type: string, encoding?: BufferEncoding) => {
    const key = Buffer.from(TezosMessageUtils.writePackedData(value, type), encoding);
    return TezosMessageUtils.encodeBigMapKey(key);
});

ipcMain.handle('conseiljs-tezosmessageutils-simpleHash', async (event, payload: Buffer, length: number) => {
    return TezosMessageUtils.simpleHash(payload, length);
});

// TezosNodeReader

ipcMain.handle('conseiljs-TezosNodeReader-getBlockHead', async (event, server) => {
    const res = await TezosNodeReader.getBlockHead(server);
    return res;
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

ipcMain.handle('conseiljs-TezosNodeReader-getCounterForAccount', async (event, server: string, accountHash: string, chainid?: string) => {
    const res = await TezosNodeReader.getCounterForAccount(server, accountHash, chainid);
    return res;
});

ipcMain.handle('conseiljs-TezosNodeReader-getMempoolOperationsForAccount', async (event, server: string, accountHash: string, chainid?: string) => {
    const res = await TezosNodeReader.getMempoolOperationsForAccount(server, accountHash, chainid);
    return res;
});

ipcMain.handle('conseiljs-TezosNodeReader-estimateBranchTimeout', async (event, server: string, branch: string, chainid?: string) => {
    const res = await TezosNodeReader.estimateBranchTimeout(server, branch, chainid);
    return res;
});

ipcMain.handle('conseiljs-TezosNodeReader-getSpendableBalanceForAccount', async (event, server: string, accountHash: string, chainid?: string) => {
    const res = await TezosNodeReader.getSpendableBalanceForAccount(server, accountHash, chainid);
    return res;
});

ipcMain.handle('conseiljs-TezosNodeReader-getAccountForBlock', async (event, server: string, blockHash: string, accountHash: string, chainid?: string) => {
    const res = await TezosNodeReader.getAccountForBlock(server, blockHash, accountHash, chainid);
    return res;
});

// TezosNodeWriter

ipcMain.handle(
    'conseiljs-TezosNodeWriter-sendTransactionOperation',
    async (event, server: string, isLedger, password, keyStore: KeyStore, to: string, amount: number, fee?: number, offset?: number, optimizeFee?: boolean) => {
        const si = onGetSigner();
        const signer = isLedger ? si : await cloneDecryptedSigner(si, password);
        const res = await TezosNodeWriter.sendTransactionOperation(server, signer, keyStore, to, amount, fee, offset, optimizeFee);
        return res;
    }
);

ipcMain.handle(
    'conseiljs-TezosNodeWriter-sendContractInvocationOperation',
    async (
        event,
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
    ) => {
        const si = onGetSigner();
        const signer = isLedger ? si : await cloneDecryptedSigner(si, password);
        const res = await TezosNodeWriter.sendContractInvocationOperation(
            server,
            signer,
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
        return res;
    }
);

ipcMain.handle(
    'conseiljs-TezosNodeWriter-constructContractInvocationOperation',
    async (
        event,
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
    ) => {
        const res = await TezosNodeWriter.constructContractInvocationOperation(
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
        return res;
    }
);

ipcMain.handle(
    'conseiljs-TezosNodeWriter-prepareOperationGroup',
    async (event, server: string, keyStore: KeyStore, counter: number, operations: StackableOperation[], optimizeFee?: boolean) => {
        const res = await TezosNodeWriter.prepareOperationGroup(server, keyStore, counter, operations, optimizeFee);
        return res;
    }
);

ipcMain.handle(
    'conseiljs-TezosNodeWriter-sendOperation',
    async (event, server: string, operations: Operation[], isLedger: boolean, password: string, offset?: number) => {
        const si = onGetSigner();
        const signer = isLedger ? si : await cloneDecryptedSigner(si, password);
        const res = await TezosNodeWriter.sendOperation(server, operations, signer, offset);
        return res;
    }
);

ipcMain.handle('conseiljs-TezosNodeWriter-estimateOperationGroup', async (event, server: string, chainid: string, operations: Array<StackableOperation>) => {
    const res = await TezosNodeWriter.estimateOperationGroup(server, chainid, operations);
    return res;
});

ipcMain.handle(
    'conseiljs-TezosNodeWriter-appendRevealOperation',
    async (event, server: string, publicKey: string, accountHash: string, accountOperationIndex: number, operations: StackableOperation[]) => {
        const res = await TezosNodeWriter.appendRevealOperation(server, publicKey, accountHash, accountOperationIndex, operations);
        return res;
    }
);

ipcMain.handle(
    'conseiljs-TezosNodeWriter-sendIdentityActivationOperation',
    async (event, server: string, isLedger: boolean, password: string, keyStore: KeyStore, activationCode: string) => {
        const si = onGetSigner();
        const signer = isLedger ? si : await cloneDecryptedSigner(si, password);
        const res = await TezosNodeWriter.sendIdentityActivationOperation(server, signer, keyStore, activationCode);
        return res;
    }
);

ipcMain.handle(
    'conseiljs-TezosNodeWriter-testContractInvocationOperation',
    async (
        event,
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
    ) => {
        const res = await TezosNodeWriter.testContractInvocationOperation(
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
        return res;
    }
);

ipcMain.handle(
    'conseiljs-TezosNodeWriter-sendContractOriginationOperation',
    async (
        event,
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
    ) => {
        const si = onGetSigner();
        const signer = isLedger ? si : await cloneDecryptedSigner(si, password);
        const res = await TezosNodeWriter.sendContractOriginationOperation(
            server,
            signer,
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
        return res;
    }
);

// BabylonDelegationHelper

ipcMain.handle(
    'conseiljs-BabylonDelegationHelper-unSetDelegate',
    async (event, server: string, isLedger, password, keyStore: KeyStore, selectedAccountHash, fee) => {
        const si = onGetSigner();
        const signer = isLedger ? si : await cloneDecryptedSigner(si, password);
        const res = await BabylonDelegationHelper.unSetDelegate(server, signer, keyStore, selectedAccountHash, fee);
        return res;
    }
);

ipcMain.handle(
    'conseiljs-BabylonDelegationHelper-setDelegate',
    async (event, server: string, isLedger, password, keyStore: KeyStore, selectedAccountHash, delegateAddress, fee) => {
        const si = onGetSigner();
        const signer = isLedger ? si : await cloneDecryptedSigner(si, password);
        const res = await BabylonDelegationHelper.setDelegate(server, signer, keyStore, selectedAccountHash, delegateAddress, fee);
        return res;
    }
);

ipcMain.handle(
    'conseiljs-BabylonDelegationHelper-withdrawDelegatedFunds',
    async (event, server: string, isLedger, password, keyStore: KeyStore, contract: string, fee: number, amount: number) => {
        const si = onGetSigner();
        const signer = isLedger ? si : await cloneDecryptedSigner(si, password);
        const res = await BabylonDelegationHelper.withdrawDelegatedFunds(server, signer, keyStore, contract, fee, amount);
        return res;
    }
);

ipcMain.handle(
    'conseiljs-BabylonDelegationHelper-depositDelegatedFunds',
    async (event, server: string, isLedger, password, keyStore: KeyStore, contract: string, fee: number, amount: number) => {
        const si = onGetSigner();
        const signer = isLedger ? si : await cloneDecryptedSigner(si, password);
        const res = await BabylonDelegationHelper.depositDelegatedFunds(server, signer, keyStore, contract, fee, amount);
        return res;
    }
);

ipcMain.handle(
    'conseiljs-BabylonDelegationHelper-sendDelegatedFunds',
    async (event, server: string, isLedger, password, keyStore: KeyStore, contract: string, fee: number, amount: number, destination: string) => {
        const si = onGetSigner();
        const signer = isLedger ? si : await cloneDecryptedSigner(si, password);
        const res = await BabylonDelegationHelper.sendDelegatedFunds(server, signer, keyStore, contract, fee, amount, destination);
        return res;
    }
);

ipcMain.handle(
    'conseiljs-BabylonDelegationHelper-deployManagerContract',
    async (event, server: string, isLedger, password, keyStore: KeyStore, delegate: string, fee: number, amount: number, optimizeFee?: boolean) => {
        const si = onGetSigner();
        const signer = isLedger ? si : await cloneDecryptedSigner(si, password);
        const res = await BabylonDelegationHelper.deployManagerContract(server, signer, keyStore, delegate, fee, amount, optimizeFee);
        return res;
    }
);

// WrappedTezosHelper
ipcMain.handle(
    'conseiljs-WrappedTezosHelper-transferBalance',
    async (
        event,
        server: string,
        isLedger,
        password,
        keyStore: KeyStore,
        tokenContractAddress: string,
        fee: number,
        sourceAddress: string,
        destinationAddress: string,
        amount: number | string,
        gasLimit?: number,
        storageLimit?: number
    ) => {
        const si = onGetSigner();
        const signer = isLedger ? si : await cloneDecryptedSigner(si, password);
        const res = await WrappedTezosHelper.transferBalance(
            server,
            signer,
            keyStore,
            tokenContractAddress,
            fee,
            sourceAddress,
            destinationAddress,
            amount,
            gasLimit,
            storageLimit
        );
        return res;
    }
);

ipcMain.handle(
    'conseiljs-WrappedTezosHelper-deployOven',
    async (
        event,
        server: string,
        isLedger,
        password,
        keyStore: KeyStore,
        fee: number,
        coreAddress: string,
        baker?: string | undefined,
        gasLimit?: number,
        storageLimit?: number
    ) => {
        const si = onGetSigner();
        const signer = isLedger ? si : await cloneDecryptedSigner(si, password);
        const res = await WrappedTezosHelper.deployOven(server, signer, keyStore, fee, coreAddress, baker, gasLimit, storageLimit);
        return res;
    }
);

ipcMain.handle(
    'conseiljs-WrappedTezosHelper-depositToOven',
    async (
        event,
        server: string,
        isLedger,
        password,
        keyStore: KeyStore,
        ovenAddress: string,
        fee: number,
        amountMutez: number,
        gasLimit?: number,
        storageLimit?: number
    ) => {
        const si = onGetSigner();
        const signer = isLedger ? si : await cloneDecryptedSigner(si, password);
        const res = await WrappedTezosHelper.depositToOven(server, signer, keyStore, ovenAddress, fee, amountMutez, gasLimit, storageLimit);
        return res;
    }
);
ipcMain.handle(
    'conseiljs-WrappedTezosHelper-withdrawFromOven',
    async (
        event,
        server: string,
        isLedger,
        password,
        keyStore: KeyStore,
        ovenAddress: string,
        fee: number,
        amountMutez: number,
        gasLimit?: number,
        storageLimit?: number
    ) => {
        const si = onGetSigner();
        const signer = isLedger ? si : await cloneDecryptedSigner(si, password);
        const res = await WrappedTezosHelper.withdrawFromOven(server, signer, keyStore, ovenAddress, fee, amountMutez, gasLimit, storageLimit);
        return res;
    }
);

ipcMain.handle(
    'conseiljs-WrappedTezosHelper-setOvenBaker',
    async (
        event,
        server: string,
        isLedger,
        password,
        keyStore: KeyStore,
        fee: number,
        ovenAddress: string,
        bakerAddress: string,
        gasLimit?: number,
        storageLimit?: number
    ) => {
        const si = onGetSigner();
        const signer = isLedger ? si : await cloneDecryptedSigner(si, password);
        const res = await WrappedTezosHelper.setOvenBaker(server, signer, keyStore, fee, ovenAddress, bakerAddress, gasLimit, storageLimit);
        return res;
    }
);

ipcMain.handle('conseiljs-WrappedTezosHelper-getAccountBalance', async (event, server: string, mapid: number, account: string) => {
    const res = await WrappedTezosHelper.getAccountBalance(server, mapid, account);
    return res;
});

ipcMain.handle('conseiljs-WrappedTezosHelper-getSimpleStorage', async (event, server: string, address: string) => {
    const res = await WrappedTezosHelper.getSimpleStorage(server, address);
    return res;
});

ipcMain.handle(
    'conseiljs-WrappedTezosHelper-listOvens',
    async (event, serverInfo: ConseilServerInfo, coreContractAddress: string, ovenOwner: string, ovenListBigMapId: number) => {
        const res = await WrappedTezosHelper.listOvens(serverInfo, coreContractAddress, ovenOwner, ovenListBigMapId);
        return res;
    }
);

// TezosConseilClient
ipcMain.handle(
    'conseiljs-TezosConseilClient-awaitOperationConfirmation',
    async (event, serverInfo: ConseilServerInfo, network: string, hash: string, duration?: number, blocktime?: number) => {
        const res = await TezosConseilClient.awaitOperationConfirmation(serverInfo, network, hash, duration, blocktime);
        return res;
    }
);

ipcMain.handle('conseiljs-TezosConseilClient-getOperations', async (event, serverInfo: ConseilServerInfo, network: string, query: ConseilQuery) => {
    const res = await TezosConseilClient.getOperations(serverInfo, network, query);
    return res;
});

ipcMain.handle('conseiljs-TezosConseilClient-getBlockHead', async (event, serverInfo: ConseilServerInfo, network: string) => {
    const res = await TezosConseilClient.getBlockHead(serverInfo, network);
    return res;
});

ipcMain.handle('conseiljs-TezosConseilClient-getAccount', async (event, serverInfo: ConseilServerInfo, network: string, accountID: string) => {
    const res = await TezosConseilClient.getAccount(serverInfo, network, accountID);
    return res;
});

ipcMain.handle('conseiljs-TezosConseilClient-countKeysInMap', async (event, serverInfo: ConseilServerInfo, mapIndex: number) => {
    const res = await TezosConseilClient.countKeysInMap(serverInfo, mapIndex);
    return res;
});

ipcMain.handle(
    'conseiljs-TezosConseilClient-getTezosEntityData',
    async (event, serverInfo: ConseilServerInfo, network: string, entity: string, query: ConseilQuery) => {
        const res = await TezosConseilClient.getTezosEntityData(serverInfo, network, entity, query);
        return res;
    }
);
ipcMain.handle(
    'conseiljs-TezosConseilClient-getFeeStatistics',
    async (event, serverInfo: ConseilServerInfo, network: string, operationType: OperationKindType) => {
        const res = await TezosConseilClient.getFeeStatistics(serverInfo, network, operationType);
        return res;
    }
);

// Tzip7ReferenceTokenHelper
ipcMain.handle(
    'conseiljs-Tzip7ReferenceTokenHelper-transferBalance',
    async (
        event,
        server: string,
        isLedger,
        password,
        keyStore: KeyStore,
        tokenContractAddress: string,
        fee: number,
        sourceAddress: string,
        destinationAddress: string,
        amount: number,
        gas: number,
        freight: number
    ) => {
        const si = onGetSigner();
        const signer = isLedger ? si : await cloneDecryptedSigner(si, password);
        const res = await Tzip7ReferenceTokenHelper.transferBalance(
            server,
            signer,
            keyStore,
            tokenContractAddress,
            fee,
            sourceAddress,
            destinationAddress,
            amount,
            gas,
            freight
        );
        return res;
    }
);

ipcMain.handle(
    'conseiljs-Tzip7ReferenceTokenHelper-mint',
    async (
        event,
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
    ) => {
        const si = onGetSigner();
        const signer = isLedger ? si : await cloneDecryptedSigner(si, password);
        const res = await Tzip7ReferenceTokenHelper.mint(server, signer, keystore, contract, fee, destination, amount, gas, freight);
        return res;
    }
);

ipcMain.handle(
    'conseiljs-Tzip7ReferenceTokenHelper-burn',
    async (
        event,
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
    ) => {
        const si = onGetSigner();
        const signer = isLedger ? si : await cloneDecryptedSigner(si, password);
        const res = await Tzip7ReferenceTokenHelper.burn(server, signer, keystore, contract, fee, source, amount, gas, freight);
        return res;
    }
);

ipcMain.handle('conseiljs-Tzip7ReferenceTokenHelper-getAccountBalance', async (event, server: string, mapid: number, account: string, balancePath?: string) => {
    const res = await Tzip7ReferenceTokenHelper.getAccountBalance(server, mapid, account, balancePath);
    return res;
});

ipcMain.handle('conseiljs-Tzip7ReferenceTokenHelper-getSimpleStorage', async (event, server: string, address: string) => {
    const res = await Tzip7ReferenceTokenHelper.getSimpleStorage(server, address);
    return res;
});

// MultiAssetTokenHelper
ipcMain.handle(
    'conseiljs-MultiAssetTokenHelper-transfer',
    async (
        event,
        server: string,
        address: string,
        isLedger: boolean,
        password: string,
        keystore: KeyStore,
        fee: number,
        transfers: TransferPair[],
        gas?: number,
        freight?: number
    ) => {
        const si = onGetSigner();
        const signer = isLedger ? si : await cloneDecryptedSigner(si, password);
        const res = await MultiAssetTokenHelper.transfer(server, address, signer, keystore, fee, transfers, gas, freight);
        return res;
    }
);

ipcMain.handle(
    'conseiljs-MultiAssetTokenHelper-getAccountBalance',
    async (event, server: string, mapid: number, account: string, tokenid: number, balancePath?: string) => {
        const res = await MultiAssetTokenHelper.getAccountBalance(server, mapid, account, tokenid, balancePath);
        return res;
    }
);

ipcMain.handle('conseiljs-MultiAssetTokenHelper-getSimpleStorage', async (event, server: string, address: string) => {
    const res = await MultiAssetTokenHelper.getSimpleStorage(server, address);
    return res;
});

// SingleAssetTokenHelper
ipcMain.handle(
    'conseiljs-SingleAssetTokenHelper-transfer',
    async (
        event,
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
    ) => {
        const si = onGetSigner();
        const signer = isLedger ? si : await cloneDecryptedSigner(si, password);
        const res = await SingleAssetTokenHelper.transfer(server, address, signer, keystore, fee, source, transfers, gas, freight);
        return res;
    }
);

ipcMain.handle('conseiljs-SingleAssetTokenHelper-getAccountBalance', async (event, server: string, mapid: number, account: string, balancePath?: string) => {
    const res = await SingleAssetTokenHelper.getAccountBalance(server, mapid, account, balancePath);
    return res;
});

ipcMain.handle('conseiljs-SingleAssetTokenHelper-getSimpleStorage', async (event, server: string, address: string) => {
    const res = await SingleAssetTokenHelper.getSimpleStorage(server, address);
    return res;
});

// TzbtcTokenHelper
ipcMain.handle(
    'conseiljs-TzbtcTokenHelper-transferBalance',
    async (
        event,
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
    ) => {
        const si = onGetSigner();
        const signer = isLedger ? si : await cloneDecryptedSigner(si, password);
        const res = await TzbtcTokenHelper.transferBalance(server, signer, keystore, contract, fee, source, destination, amount, gas, freight);
        return res;
    }
);

ipcMain.handle('conseiljs-TzbtcTokenHelper-getAccountBalance', async (event, server: string, mapid: number, account: string) => {
    const res = await TzbtcTokenHelper.getAccountBalance(server, mapid, account);
    return res;
});

ipcMain.handle('conseiljs-TzbtcTokenHelper-getTokenSupply', async (event, server: string, mapid: number) => {
    const res = await TzbtcTokenHelper.getTokenSupply(server, mapid);
    return res;
});

ipcMain.handle('conseiljs-TzbtcTokenHelper-getPaused', async (event, server: string, mapid: number) => {
    const res = await TzbtcTokenHelper.getPaused(server, mapid);
    return res;
});

// ConseilDataClient
ipcMain.handle(
    'conseiljs-ConseilDataClient-executeEntityQuery',
    async (event, serverInfo: ConseilServerInfo, platform: string, network: string, entity: string, query: ConseilQuery) => {
        const res = await ConseilDataClient.executeEntityQuery(serverInfo, platform, network, entity, query);
        return res;
    }
);

// KolibriTokenHelper
ipcMain.handle('conseiljs-KolibriTokenHelper-getAccountBalance', async (event, server: string, mapid: number, account: string) => {
    const res = await KolibriTokenHelper.getAccountBalance(server, mapid, account);
    return res;
});

ipcMain.handle('conseiljs-KolibriTokenHelper-getSimpleStorage', async (event, server: string, address: string) => {
    const res = await KolibriTokenHelper.getSimpleStorage(server, address);
    return res;
});
