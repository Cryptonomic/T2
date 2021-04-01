import { WrappedTezosHelper, OpenOvenResult, TezosNodeReader, TezosConseilClient, ConseilServerInfo } from 'conseiljs';
import { createMessageAction } from '../../reduxContent/message/actions';
import { updateTokensAction } from '../../reduxContent/wallet/actions';

import { createTokenTransaction } from '../../utils/transaction';
import { TRANSACTION } from '../../constants/TransactionTypes';

import { cloneDecryptedSigner } from '../../utils/wallet';
import { getSelectedKeyStore } from '../../utils/general';
import { getMainNode, getMainPath } from '../../utils/settings';

import { findTokenIndex } from '../../utils/token';
import { Vault, VaultToken } from '../../types/general';

export function transferThunk(destination: string, amount: string, fee: number, password: string) {
    return async (dispatch, state) => {
        const { selectedNode, nodesList, selectedPath, pathsList } = state().settings;
        const { identities, walletPassword, tokens } = state().wallet;
        const { selectedAccountHash, selectedParentHash, isLedger, signer } = state().app;
        const mainNode = getMainNode(nodesList, selectedNode);
        const { tezosUrl } = mainNode;

        if (password !== walletPassword && !isLedger) {
            const error = 'components.messageBar.messages.incorrect_password';
            dispatch(createMessageAction(error, true));
            return false;
        }

        const mainPath = getMainPath(pathsList, selectedPath);
        const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger, mainPath);

        const operationId: string | undefined = await WrappedTezosHelper.transferBalance(
            tezosUrl,
            isLedger ? signer : await cloneDecryptedSigner(signer, password),
            keyStore,
            selectedAccountHash,
            fee,
            selectedParentHash,
            destination,
            amount
        ).catch((err) => {
            const errorObj = { name: err.message, ...err };
            console.error(`transferBalance failed with ${JSON.stringify(errorObj)}`);
            dispatch(createMessageAction(errorObj.name, true));
            return undefined;
        });

        if (operationId === undefined) {
            return false;
        }

        dispatch(createMessageAction('components.messageBar.messages.started_token_success', false, operationId));

        const transaction = createTokenTransaction({
            amount,
            destination,
            kind: TRANSACTION,
            source: selectedParentHash,
            operation_group_hash: operationId,
            fee,
        });

        const tokenIndex = findTokenIndex(tokens, selectedAccountHash);

        if (tokenIndex > -1) {
            tokens[tokenIndex].transactions.push(transaction);
        }

        dispatch(updateTokensAction([...tokens]));
        return true;
    };
}

export function deployOven(fee: number, password: string, initialDelegate: string | undefined) {
    return async (dispatch, state) => {
        const { selectedNode, nodesList, selectedPath, pathsList } = state().settings;
        const { identities, walletPassword, tokens } = state().wallet;
        const { selectedAccountHash, selectedParentHash, isLedger, signer } = state().app;
        const mainNode = getMainNode(nodesList, selectedNode);
        const { tezosUrl } = mainNode;

        if (password !== walletPassword && !isLedger) {
            const error = 'components.messageBar.messages.incorrect_password';
            dispatch(createMessageAction(error, true));
            return false;
        }

        const mainPath = getMainPath(pathsList, selectedPath);
        const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger, mainPath);

        let coreContractAddress = '';
        const tokenIndex = findTokenIndex(tokens, selectedAccountHash);
        if (tokenIndex > -1) {
            const token = tokens[tokenIndex] as VaultToken;
            coreContractAddress = token.vaultCoreAddress;
        }

        const result = await WrappedTezosHelper.deployOven(
            tezosUrl,
            isLedger ? signer : await cloneDecryptedSigner(signer, password),
            keyStore,
            fee,
            coreContractAddress,
            initialDelegate
        ).catch((err) => {
            const errorObj = { name: err.message, ...err };
            console.error(`deployOven failed with ${JSON.stringify(errorObj)}`);
            dispatch(createMessageAction(errorObj.name, true));
            return false;
        });

        if (!result) {
            return false;
        }

        const openOvenResult = result as OpenOvenResult;

        // Wait for operation to hit chain.
        const conseilServerInfo: ConseilServerInfo = {
            url: mainNode.conseilUrl,
            apiKey: mainNode.apiKey,
            network: mainNode.network,
        };
        await TezosConseilClient.awaitOperationConfirmation(conseilServerInfo, mainNode.network, openOvenResult.operationHash, 5, 60);

        dispatch(
            createMessageAction(
                // TODO(keefertaylor): Use translations here.
                `Completed vault deployment at ${openOvenResult.ovenAddress}`,
                false,
                openOvenResult.operationHash
            )
        );

        if (tokenIndex > -1) {
            const token = tokens[tokenIndex] as VaultToken;
            token.vaultList.unshift({
                ovenAddress: openOvenResult.ovenAddress,
                ovenOwner: keyStore.publicKeyHash,
                ovenBalance: 0,
                baker: initialDelegate,
            });
            tokens[tokenIndex] = token;
        }
        dispatch(updateTokensAction([...tokens]));

        return true;
    };
}

export function deposit(ovenAddress: string, amount: number, fee: number, password: string) {
    return async (dispatch, state) => {
        const { selectedNode, nodesList, selectedPath, pathsList } = state().settings;
        const { identities, walletPassword, tokens } = state().wallet;
        const { selectedAccountHash, selectedParentHash, isLedger, signer } = state().app;
        const mainNode = getMainNode(nodesList, selectedNode);
        const { tezosUrl } = mainNode;

        if (password !== walletPassword && !isLedger) {
            const error = 'components.messageBar.messages.incorrect_password';
            dispatch(createMessageAction(error, true));
            return false;
        }

        const mainPath = getMainPath(pathsList, selectedPath);
        const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger, mainPath);

        const operationId: string | undefined = await WrappedTezosHelper.depositToOven(
            tezosUrl,
            isLedger ? signer : await cloneDecryptedSigner(signer, password),
            keyStore,
            ovenAddress,
            fee,
            amount
        ).catch((err) => {
            const errorObj = { name: err.message, ...err };
            console.error(`deposit failed with ${JSON.stringify(errorObj)}`);
            dispatch(createMessageAction(errorObj.name, true));
            return undefined;
        });

        if (operationId === undefined) {
            return false;
        }

        // Wait for operation to hit chain.
        const conseilServerInfo: ConseilServerInfo = {
            url: mainNode.conseilUrl,
            apiKey: mainNode.apiKey,
            network: mainNode.network,
        };
        await TezosConseilClient.awaitOperationConfirmation(conseilServerInfo, mainNode.network, operationId, 5, 60);

        const tokenIndex = findTokenIndex(tokens, selectedAccountHash);
        if (tokenIndex > -1) {
            const token = tokens[tokenIndex] as VaultToken;
            const ovenIndex = findOvenIndex(ovenAddress, token.vaultList);
            if (ovenIndex === -1) {
                return false;
            }

            // Increment oven balance and wXTZ balance.
            token.balance = token.balance += amount;
            token.vaultList[ovenIndex].ovenBalance = token.vaultList[ovenIndex].ovenBalance += amount;
            tokens[tokenIndex] = token;
        }
        dispatch(updateTokensAction([...tokens]));

        dispatch(createMessageAction('Completed deposit operation.', false, operationId));

        return true;
    };
}

export function withdraw(ovenAddress: string, amount: number, fee: number, password: string) {
    return async (dispatch, state) => {
        const { selectedNode, nodesList, selectedPath, pathsList } = state().settings;
        const { identities, walletPassword, tokens } = state().wallet;
        const { selectedAccountHash, selectedParentHash, isLedger, signer } = state().app;
        const mainNode = getMainNode(nodesList, selectedNode);
        const { tezosUrl } = mainNode;

        if (password !== walletPassword && !isLedger) {
            const error = 'components.messageBar.messages.incorrect_password';
            dispatch(createMessageAction(error, true));
            return false;
        }

        const mainPath = getMainPath(pathsList, selectedPath);
        const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger, mainPath);

        const operationId: string | undefined = await WrappedTezosHelper.withdrawFromOven(
            tezosUrl,
            isLedger ? signer : await cloneDecryptedSigner(signer, password),
            keyStore,
            ovenAddress,
            fee,
            amount
        ).catch((err) => {
            const errorObj = { name: err.message, ...err };
            console.error(`withdraw failed with ${JSON.stringify(errorObj)}`);
            dispatch(createMessageAction(errorObj.name, true));
            return undefined;
        });

        if (operationId === undefined) {
            return false;
        }

        // Wait for operation to hit chain.
        const conseilServerInfo: ConseilServerInfo = {
            url: mainNode.conseilUrl,
            apiKey: mainNode.apiKey,
            network: mainNode.network,
        };
        await TezosConseilClient.awaitOperationConfirmation(conseilServerInfo, mainNode.network, operationId, 5, 60);

        const tokenIndex = findTokenIndex(tokens, selectedAccountHash);
        if (tokenIndex > -1) {
            const token = tokens[tokenIndex] as VaultToken;
            const ovenIndex = findOvenIndex(ovenAddress, token.vaultList);
            if (ovenIndex === -1) {
                return false;
            }

            // Increment oven balance and wXTZ balance.
            token.balance = token.balance -= amount;
            token.vaultList[ovenIndex].ovenBalance = token.vaultList[ovenIndex].ovenBalance -= amount;
            tokens[tokenIndex] = token;
        }
        dispatch(updateTokensAction([...tokens]));

        dispatch(createMessageAction('Completed withdraw operation.', false, operationId));

        return true;
    };
}

export function setDelegateForOven(ovenAddress: string, newDelegate: string, fee: number, password: string) {
    return async (dispatch, state) => {
        const { selectedNode, nodesList, selectedPath, pathsList } = state().settings;
        const { identities, walletPassword, tokens } = state().wallet;
        const { selectedAccountHash, selectedParentHash, isLedger, signer } = state().app;
        const mainNode = getMainNode(nodesList, selectedNode);
        const { tezosUrl } = mainNode;

        if (password !== walletPassword && !isLedger) {
            const error = 'components.messageBar.messages.incorrect_password';
            dispatch(createMessageAction(error, true));
            return false;
        }

        const mainPath = getMainPath(pathsList, selectedPath);
        const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger, mainPath);

        const operationId: string | undefined = await WrappedTezosHelper.setOvenBaker(
            tezosUrl,
            isLedger ? signer : await cloneDecryptedSigner(signer, password),
            keyStore,
            fee,
            ovenAddress,
            newDelegate
        ).catch((err) => {
            const errorObj = { name: err.message, ...err };
            console.error(`withdraw failed with ${JSON.stringify(errorObj)}`);
            dispatch(createMessageAction(errorObj.name, true));
            return undefined;
        });

        if (operationId === undefined) {
            return false;
        }

        // Wait for operation to hit chain.
        const conseilServerInfo: ConseilServerInfo = {
            url: mainNode.conseilUrl,
            apiKey: mainNode.apiKey,
            network: mainNode.network,
        };
        await TezosConseilClient.awaitOperationConfirmation(conseilServerInfo, mainNode.network, operationId, 5, 60);

        const tokenIndex = findTokenIndex(tokens, selectedAccountHash);
        if (tokenIndex > -1) {
            const token = tokens[tokenIndex] as VaultToken;
            const ovenIndex = findOvenIndex(ovenAddress, token.vaultList);
            if (ovenIndex === -1) {
                return false;
            }

            // Increment oven balance and wXTZ balance.
            token.vaultList[ovenIndex].baker = newDelegate;
            tokens[tokenIndex] = token;
        }
        dispatch(updateTokensAction([...tokens]));

        dispatch(createMessageAction('Completed set delegate operation', false, operationId));

        return true;
    };
}

function findOvenIndex(ovenAddress: string, vaultList: Vault[]) {
    for (let i = 0; i < vaultList.length; i++) {
        if (vaultList[i].ovenAddress === ovenAddress) {
            return i;
        }
    }
    return -1;
}
