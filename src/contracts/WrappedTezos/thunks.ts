import { WrappedTezosHelper, OpenOvenResult, TezosNodeReader, TezosConseilClient, ConseilServerInfo } from 'conseiljs';
import { createMessageAction } from '../../reduxContent/message/actions';
import { updateOvensAction, updateTokensAction } from '../../reduxContent/wallet/actions';

import { createTokenTransaction } from '../../utils/transaction';
import { TRANSACTION } from '../../constants/TransactionTypes';

import { getSelectedKeyStore } from '../../utils/general';
import { getMainNode, getMainPath } from '../../utils/settings';

import { findTokenIndex } from '../../utils/token';
import { Vault, VaultToken } from '../../types/general';
import { keys } from '@material-ui/core/styles/createBreakpoints';

export function transferThunk(destination: string, amount: number, fee: number, password: string) {
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

        const operationId: string | boolean = await WrappedTezosHelper.transferBalance(
            tezosUrl,
            signer,
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
            return false;
        });

        if (!operationId) {
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

        // TODO(keefertaylor): Do not hardcode.
        const coreContractAddress = 'KT1S98ELFTo6mdMBqhAVbGgKAVgLbdPP3AX8';

        console.log('STAKERDAO - initial delegate: ' + initialDelegate);
        const result = await WrappedTezosHelper.deployOven(tezosUrl, signer, keyStore, fee, coreContractAddress, initialDelegate).catch((err) => {
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
                `Successfully started deploy operation for ${openOvenResult.ovenAddress}`,
                false,
                openOvenResult.operationHash
            )
        );

        const tokenIndex = findTokenIndex(tokens, selectedAccountHash);
        if (tokenIndex > -1) {
            const token = tokens[tokenIndex] as VaultToken;
            token.ovenList.unshift({
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

        const operationId: string | boolean = await WrappedTezosHelper.depositToOven(tezosUrl, signer, keyStore, ovenAddress, fee, amount).catch((err) => {
            const errorObj = { name: err.message, ...err };
            console.error(`deposit failed with ${JSON.stringify(errorObj)}`);
            dispatch(createMessageAction(errorObj.name, true));
            return false;
        });

        if (!operationId) {
            return false;
        }

        // Wait for operation to hit chain.
        const conseilServerInfo: ConseilServerInfo = {
            url: mainNode.conseilUrl,
            apiKey: mainNode.apiKey,
            network: mainNode.network,
        };
        await TezosConseilClient.awaitOperationConfirmation(conseilServerInfo, mainNode.network, operationId as string, 5, 60);

        const tokenIndex = findTokenIndex(tokens, selectedAccountHash);
        if (tokenIndex > -1) {
            const token = tokens[tokenIndex] as VaultToken;
            const ovenIndex = findOvenIndex(ovenAddress, token.ovenList);
            if (ovenIndex === -1) {
                return false;
            }

            // Increment oven balance and wXTZ balance.
            token.balance = token.balance += amount;
            token.ovenList[ovenIndex].ovenBalance = token.ovenList[ovenIndex].ovenBalance += amount;
            tokens[tokenIndex] = token;

            console.log('[Stakerdao] New user balance: ' + tokens[tokenIndex].balance);
            console.log('[Stakerdao] new ovenbalance: ' + tokens[tokenIndex].ovenList[ovenIndex].balance);
        }
        dispatch(updateTokensAction([...tokens]));

        dispatch(createMessageAction('Successfully started deposit transaction.', false, operationId as string));

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

        const operationId: string | boolean = await WrappedTezosHelper.withdrawFromOven(tezosUrl, signer, keyStore, ovenAddress, fee, amount).catch((err) => {
            const errorObj = { name: err.message, ...err };
            console.error(`withdraw failed with ${JSON.stringify(errorObj)}`);
            dispatch(createMessageAction(errorObj.name, true));
            return false;
        });

        if (!operationId) {
            return false;
        }

        // Wait for operation to hit chain.
        const conseilServerInfo: ConseilServerInfo = {
            url: mainNode.conseilUrl,
            apiKey: mainNode.apiKey,
            network: mainNode.network,
        };
        await TezosConseilClient.awaitOperationConfirmation(conseilServerInfo, mainNode.network, operationId as string, 5, 60);

        const tokenIndex = findTokenIndex(tokens, selectedAccountHash);
        if (tokenIndex > -1) {
            const token = tokens[tokenIndex] as VaultToken;
            const ovenIndex = findOvenIndex(ovenAddress, token.ovenList);
            if (ovenIndex === -1) {
                return false;
            }

            // Increment oven balance and wXTZ balance.
            token.balance = token.balance -= amount;
            token.ovenList[ovenIndex].ovenBalance = token.ovenList[ovenIndex].ovenBalance -= amount;
            tokens[tokenIndex] = token;

            // TODO(keefertaylor): clean up stakerdao's logging.
            console.log('[Stakerdao] New user balance: ' + tokens[tokenIndex].balance);
            console.log('[Stakerdao] new ovenbalance: ' + tokens[tokenIndex].ovenList[ovenIndex].balance);
        }
        dispatch(updateTokensAction([...tokens]));

        dispatch(createMessageAction('Successfully started withdraw transaction.', false, operationId as string));

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

        const operationId: string | boolean = await WrappedTezosHelper.setOvenBaker(tezosUrl, signer, keyStore, fee, ovenAddress, newDelegate).catch((err) => {
            const errorObj = { name: err.message, ...err };
            console.error(`withdraw failed with ${JSON.stringify(errorObj)}`);
            dispatch(createMessageAction(errorObj.name, true));
            return false;
        });

        if (!operationId) {
            return false;
        }

        // Wait for operation to hit chain.
        const conseilServerInfo: ConseilServerInfo = {
            url: mainNode.conseilUrl,
            apiKey: mainNode.apiKey,
            network: mainNode.network,
        };
        await TezosConseilClient.awaitOperationConfirmation(conseilServerInfo, mainNode.network, operationId as string, 5, 60);

        const tokenIndex = findTokenIndex(tokens, selectedAccountHash);
        if (tokenIndex > -1) {
            const token = tokens[tokenIndex] as VaultToken;
            const ovenIndex = findOvenIndex(ovenAddress, token.ovenList);
            if (ovenIndex === -1) {
                return false;
            }

            // Increment oven balance and wXTZ balance.
            token.ovenList[ovenIndex].baker = newDelegate;
            tokens[tokenIndex] = token;

            // TODO(keefertaylor): clean up stakerdao's logging.
            console.log('[Stakerdao] New deleaget balance: ' + tokens[tokenIndex].ovenList[ovenIndex].baker);
        }
        dispatch(updateTokensAction([...tokens]));

        dispatch(createMessageAction('Successfully started set delegate transation', false, operationId as string));

        return true;
    };
}

function findOvenIndex(ovenAddress: string, ovenList: Vault[]) {
    for (let i = 0; i < ovenList.length; i++) {
        if (ovenList[i].ovenAddress === ovenAddress) {
            return i;
        }
    }
    return -1;
}
