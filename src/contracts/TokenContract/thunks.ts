import { Tzip7ReferenceTokenHelper } from 'conseiljs';
import { createMessageAction } from '../../reduxContent/message/actions';
import { updateTokensAction } from '../../reduxContent/wallet/actions';

import { createTransaction, createTokenTransaction } from '../../utils/transaction';
import { TRANSACTION } from '../../constants/TransactionTypes';

import { getSelectedKeyStore, clearOperationId } from '../../utils/general';
import { getMainNode, getMainPath } from '../../utils/settings';

import { findTokenIndex } from '../../utils/token';

const { transferBalance, mint, burn } = Tzip7ReferenceTokenHelper;

const GAS = 125000; // TODO
const FREIGHT = 1000;

export function transferThunk(destination: string, amount: number, fee: number, password: string) {
    return async (dispatch, state) => {
        const { selectedNode, nodesList, selectedPath, pathsList } = state().settings;
        const { identities, walletPassword, tokens } = state().wallet;
        const { selectedAccountHash, selectedParentHash, isLedger } = state().app;
        const mainNode = getMainNode(nodesList, selectedNode);
        const { tezosUrl } = mainNode;

        if (password !== walletPassword && !isLedger) {
            const error = 'components.messageBar.messages.incorrect_password';
            dispatch(createMessageAction(error, true));
            return false;
        }

        const mainPath = getMainPath(pathsList, selectedPath);
        const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger, mainPath);

        const operationId: string | boolean = await transferBalance(
            tezosUrl,
            keyStore,
            selectedAccountHash,
            fee,
            selectedParentHash,
            destination,
            amount,
            GAS,
            FREIGHT
        ).catch(err => {
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
            fee
        });

        const tokenIndex = findTokenIndex(tokens, selectedAccountHash);

        if (tokenIndex > -1) {
            tokens[tokenIndex].transactions.push(transaction);
        }

        dispatch(updateTokensAction([...tokens]));
        return true;
    };
}

export function mintThunk(destination: string, amount: number, fee: number, password: string) {
    return async (dispatch, state) => {
        const { selectedNode, nodesList, selectedPath, pathsList } = state().settings;
        const { identities, walletPassword, tokens } = state().wallet;
        const { selectedAccountHash, selectedParentHash, isLedger } = state().app;
        const mainNode = getMainNode(nodesList, selectedNode);
        const { tezosUrl } = mainNode;

        if (password !== walletPassword && !isLedger) {
            const error = 'components.messageBar.messages.incorrect_password';
            dispatch(createMessageAction(error, true));
            return false;
        }

        const mainPath = getMainPath(pathsList, selectedPath);

        const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger, mainPath);

        const res: any = await mint(tezosUrl, keyStore, selectedAccountHash, fee, destination, amount, GAS, FREIGHT).catch(err => {
            const errorObj = { name: err.message, ...err };
            console.error(errorObj);
            dispatch(createMessageAction(errorObj.name, true));
            return false;
        });

        if (res) {
            const operationResult =
                res &&
                res.results &&
                res.results.contents &&
                res.results.contents[0] &&
                res.results.contents[0].metadata &&
                res.results.contents[0].metadata.operation_result;

            if (operationResult && operationResult.errors && operationResult.errors.length) {
                const error = 'components.messageBar.messages.mint_operation_failed';
                console.error(error);
                dispatch(createMessageAction(error, true));
                return false;
            }

            const clearedOperationId = clearOperationId(res.operationGroupID);

            dispatch(createMessageAction('components.messageBar.messages.mint_operation_success', false, clearedOperationId));

            const transaction = createTransaction({
                amount,
                destination,
                kind: TRANSACTION,
                source: keyStore.publicKeyHash,
                operation_group_hash: clearedOperationId,
                fee,
                entryPoint: 'mint'
            });

            const tokenIndex = findTokenIndex(tokens, selectedAccountHash);

            if (tokenIndex > -1) {
                tokens[tokenIndex].transactions.push(transaction);
            }

            dispatch(updateTokensAction([...tokens]));
            return true;
        }
        return false;
    };
}

export function burnThunk(destination: string, amount: number, fee: number, password: string) {
    return async (dispatch, state) => {
        const { selectedNode, nodesList, selectedPath, pathsList } = state().settings;
        const { identities, walletPassword, tokens } = state().wallet;
        const { selectedAccountHash, selectedParentHash, isLedger } = state().app;
        const mainNode = getMainNode(nodesList, selectedNode);
        const { tezosUrl } = mainNode;

        if (password !== walletPassword && !isLedger) {
            const error = 'components.messageBar.messages.incorrect_password';
            dispatch(createMessageAction(error, true));
            return false;
        }

        const mainPath = getMainPath(pathsList, selectedPath);

        const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger, mainPath);

        const res: any = await burn(tezosUrl, keyStore, selectedAccountHash, fee, destination, amount, GAS, FREIGHT).catch(err => {
            const errorObj = { name: err.message, ...err };
            console.error(errorObj);
            dispatch(createMessageAction(errorObj.name, true));
            return false;
        });

        if (res) {
            const operationResult =
                res &&
                res.results &&
                res.results.contents &&
                res.results.contents[0] &&
                res.results.contents[0].metadata &&
                res.results.contents[0].metadata.operation_result;

            if (operationResult && operationResult.errors && operationResult.errors.length) {
                const error = 'components.messageBar.messages.burn_operation_failed';
                console.error(error);
                dispatch(createMessageAction(error, true));
                return false;
            }

            const clearedOperationId = clearOperationId(res.operationGroupID);

            dispatch(createMessageAction('components.messageBar.messages.burn_operation_success', false, clearedOperationId));

            const transaction = createTransaction({
                amount,
                destination,
                kind: TRANSACTION,
                source: keyStore.publicKeyHash,
                operation_group_hash: clearedOperationId,
                fee,
                entryPoint: 'burn'
            });

            const tokenIndex = findTokenIndex(tokens, selectedAccountHash);

            if (tokenIndex > -1) {
                tokens[tokenIndex].transactions.push(transaction);
            }

            dispatch(updateTokensAction([...tokens]));
            return true;
        }
        return false;
    };
}
