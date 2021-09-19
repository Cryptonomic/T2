import { TezosConstants, TezosNodeReader, TezosNodeWriter, TezosParameterFormat, Transaction, TzbtcTokenHelper } from 'conseiljs';
import { createMessageAction } from '../../reduxContent/message/actions';
import { updateTokensAction } from '../../reduxContent/wallet/actions';

import { createTokenTransaction } from '../../utils/transaction';
import { TRANSACTION } from '../../constants/TransactionTypes';

import { cloneDecryptedSigner } from '../../utils/wallet';
import { getSelectedKeyStore } from '../../utils/general';
import { getMainNode, getMainPath } from '../../utils/settings';

import { findTokenIndex } from '../../utils/token';

import { constructFA1ApprovalOperation } from '../components/Swap/util';

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

        const operationId: string | undefined = await TzbtcTokenHelper.transferBalance(
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

export function addLiquidityThunk(destination: string, poolShare: string, cashAmount: string, tokenAmount: string, password: string) {
    return async (dispatch, state) => {
        const { selectedNode, nodesList, selectedPath, pathsList } = state().settings;
        const { identities, walletPassword } = state().wallet;
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

        const expiration = new Date(Date.now() + 5 * 60 * 1000);
        const params = `{ "prim": "Pair","args": [ { "string": "${
            keyStore.publicKeyHash
        }" }, { "prim": "Pair", "args": [ { "int": "${poolShare}" }, { "prim": "Pair", "args": [ { "int": "${tokenAmount}" }, { "string": "${expiration.toISOString()}" } ] } ] } ] }`;

        const ops: Transaction[] = [];
        ops.push(constructFA1ApprovalOperation(keyStore.publicKeyHash, 0, { fee: 0, gas: 0, storage: 0 }, selectedAccountHash, destination));
        ops.push(constructFA1ApprovalOperation(keyStore.publicKeyHash, 0, { fee: 0, gas: 0, storage: 0 }, selectedAccountHash, destination, tokenAmount));
        ops.push(
            TezosNodeWriter.constructContractInvocationOperation(
                keyStore.publicKeyHash,
                0,
                destination,
                Number(cashAmount),
                0,
                0,
                0,
                'removeLiquidity',
                params,
                TezosParameterFormat.Micheline
            )
        );

        const counter = await TezosNodeReader.getCounterForAccount(tezosUrl, selectedParentHash);
        const pricedOps = await TezosNodeWriter.prepareOperationGroup(tezosUrl, keyStore, counter, ops, true);
        const r = await TezosNodeWriter.sendOperation(tezosUrl, pricedOps, signer, TezosConstants.HeadBranchOffset).catch((err) => {
            const errorObj = { name: err.message, ...err };
            console.error(`Plenty harvestRewards failed with ${JSON.stringify(errorObj)}`);
            dispatch(createMessageAction(errorObj.name, true));
            return undefined;
        });

        if (r === undefined) {
            return false;
        }

        dispatch(createMessageAction('components.messageBar.messages.started_token_success', false, r?.operationGroupID.replace(/\\|"|\n|\r/g, '')));

        return true;
    };
}

export function removeLiquidityThunk(destination: string, poolShare: string, cashAmount: string, tokenAmount: string, password: string) {
    return async (dispatch, state) => {
        const { selectedNode, nodesList, selectedPath, pathsList } = state().settings;
        const { identities, walletPassword } = state().wallet;
        const { selectedParentHash, isLedger, signer } = state().app;
        const mainNode = getMainNode(nodesList, selectedNode);
        const { tezosUrl } = mainNode;

        if (password !== walletPassword && !isLedger) {
            const error = 'components.messageBar.messages.incorrect_password';
            dispatch(createMessageAction(error, true));
            return false;
        }

        const mainPath = getMainPath(pathsList, selectedPath);
        const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger, mainPath);

        const expiration = new Date(Date.now() + 5 * 60 * 1000);
        const params = `{ "prim": "Pair","args": [ { "string": "${
            keyStore.publicKeyHash
        }" }, { "prim": "Pair", "args": [ { "int": "${poolShare}" }, { "prim": "Pair", "args": [ { "int": "${cashAmount}" }, { "prim": "Pair", "args": [ { "int": "${tokenAmount}" }, { "string": "${expiration.toISOString()}" } ] } ] } ] } ] }`;

        let operationId = '';
        try {
            const r = await TezosNodeWriter.sendContractInvocationOperation(
                tezosUrl,
                signer,
                keyStore,
                destination,
                0,
                0,
                0,
                0,
                'removeLiquidity',
                params,
                TezosParameterFormat.Micheline,
                TezosConstants.HeadBranchOffset,
                true
            );

            operationId = r.operationGroupID.replace(/\\|"|\n|\r/g, '');
        } catch (err) {
            console.log(`failed in removeLiquidityThunk ${JSON.stringify(err)}}`);
        }

        if (operationId === undefined) {
            dispatch(createMessageAction('components.messageBar.messages.started_token_failed', true));
            return false;
        }

        dispatch(createMessageAction('components.messageBar.messages.started_token_success', false, operationId));

        return true;
    };
}
