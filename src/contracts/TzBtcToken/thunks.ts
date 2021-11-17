import { TezosConstants, TezosMessageUtils, TezosNodeReader, TezosNodeWriter, TezosParameterFormat, Transaction, TzbtcTokenHelper } from 'conseiljs';
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

export function addLiquidityThunk(
    destination: string,
    poolShare: string,
    cashAmount: string,
    tokenAmount: string,
    password: string,
    shortfall: string = '',
    shortfallCost: string = ''
) {
    return async (dispatch, state) => {
        const { selectedNode, nodesList, selectedPath, pathsList } = state().settings;
        const { identities, walletPassword } = state().wallet;
        const { selectedParentHash, isLedger, signer } = state().app;
        const mainNode = getMainNode(nodesList, selectedNode);
        const { tezosUrl } = mainNode;

        const selectedAccountHash = 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn'; // hack

        if (password !== walletPassword && !isLedger) {
            const error = 'components.messageBar.messages.incorrect_password';
            dispatch(createMessageAction(error, true));
            return false;
        }

        const mainPath = getMainPath(pathsList, selectedPath);
        const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger, mainPath);
        const expiration = new Date(Date.now() + 5 * 60 * 1000);

        const ops: Transaction[] = [];

        if (shortfall.length > 0 && shortfallCost.length > 0) {
            const buyOp = TezosNodeWriter.constructContractInvocationOperation(
                keyStore.publicKeyHash,
                0,
                destination,
                Number(shortfallCost),
                0,
                0,
                0,
                'xtzToToken',
                `{"prim":"Pair","args":[{"string":"${keyStore.publicKeyHash}"},{"int":"${shortfall}"},{"string":"${expiration.toISOString()}"}]}`,
                TezosParameterFormat.Micheline
            );

            ops.push(buyOp);
        }

        ops.push(constructFA1ApprovalOperation(keyStore.publicKeyHash, 0, { fee: 0, gas: 0, storage: 0 }, selectedAccountHash, destination));
        ops.push(constructFA1ApprovalOperation(keyStore.publicKeyHash, 0, { fee: 0, gas: 0, storage: 0 }, selectedAccountHash, destination, tokenAmount));

        const params = `{ "prim": "Pair","args": [ { "bytes": "${TezosMessageUtils.writeAddress(
            keyStore.publicKeyHash
        )}" }, { "prim": "Pair", "args": [ { "int": "${poolShare}" }, { "prim": "Pair", "args": [ { "int": "${tokenAmount}" }, { "string": "${expiration.toISOString()}" } ] } ] } ] }`;

        ops.push(
            TezosNodeWriter.constructContractInvocationOperation(
                keyStore.publicKeyHash,
                0,
                destination,
                Number(cashAmount),
                0,
                0,
                0,
                'addLiquidity',
                params,
                TezosParameterFormat.Micheline
            )
        );

        try {
            const counter = await TezosNodeReader.getCounterForAccount(tezosUrl, selectedParentHash);
            const pricedOps = await TezosNodeWriter.prepareOperationGroup(tezosUrl, keyStore, counter, ops, true);

            const operationResult = await TezosNodeWriter.sendOperation(
                tezosUrl,
                pricedOps,
                isLedger ? signer : await cloneDecryptedSigner(signer, password),
                TezosConstants.HeadBranchOffset
            );

            if (operationResult === undefined) {
                return false;
            }

            dispatch(
                createMessageAction('components.messageBar.messages.started_token_success', false, operationResult?.operationGroupID.replace(/\\|"|\n|\r/g, ''))
            );

            return true;
        } catch (err) {
            dispatch(createMessageAction(`Failed to submit operation with ${err}`, true));
            return false;
        }
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
        const ops = [
            TezosNodeWriter.constructContractInvocationOperation(
                keyStore.publicKeyHash,
                0,
                destination,
                0,
                0,
                0,
                0,
                'removeLiquidity',
                params,
                TezosParameterFormat.Micheline
            ),
        ];

        try {
            const counter = await TezosNodeReader.getCounterForAccount(tezosUrl, selectedParentHash);
            const pricedOps = await TezosNodeWriter.prepareOperationGroup(tezosUrl, keyStore, counter, ops, true);

            const operationResult = await TezosNodeWriter.sendOperation(
                tezosUrl,
                pricedOps,
                isLedger ? signer : await cloneDecryptedSigner(signer, password),
                TezosConstants.HeadBranchOffset
            );

            if (operationResult === undefined) {
                return false;
            }

            const operationId = operationResult.operationGroupID.replace(/\\|"|\n|\r/g, '');

            dispatch(createMessageAction('components.messageBar.messages.started_token_success', false, operationId));

            return true;
        } catch (err) {
            console.log(`failed in removeLiquidityThunk ${JSON.stringify(err)}}`);
            dispatch(createMessageAction('components.messageBar.messages.started_token_failed', true));
            return false;
        }
    };
}
