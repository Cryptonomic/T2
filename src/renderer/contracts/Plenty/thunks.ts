import { TezosParameterFormat } from 'conseiljs';
import { createMessageAction } from '../../reduxContent/message/actions';
import { updateTokensAction } from '../../reduxContent/wallet/actions';

import { createTokenTransaction } from '../../utils/transaction';
import { TRANSACTION } from '../../constants/TransactionTypes';

import { getSelectedKeyStore } from '../../utils/general';
import { getMainNode, getMainPath } from '../../utils/settings';

import { findTokenIndex } from '../../utils/token';
import { calcPendingRewards, getActivePools } from './util';

const GAS = 125000; // TODO
const FREIGHT = 1000;

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

        const operationId: string | undefined = await window.conseiljs.Tzip7ReferenceTokenHelper.transferBalance(
            tezosUrl,
            isLedger,
            password,
            keyStore,
            selectedAccountHash,
            fee,
            selectedParentHash,
            destination,
            amount,
            GAS,
            FREIGHT
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

export async function estimatePendingRewards(tezosUrl, selectedParentHash): Promise<string> {
    return calcPendingRewards(tezosUrl, selectedParentHash);
}

export function harvestRewards(password: string) {
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

        const activePools = await getActivePools(tezosUrl, selectedParentHash);
        const opsPr = activePools.map((p) =>
            window.conseiljs.TezosNodeWriter.constructContractInvocationOperation(
                selectedParentHash,
                0,
                p.contract,
                0,
                0,
                0,
                0,
                'GetReward',
                '{"prim":"Unit"}',
                TezosParameterFormat.Micheline
            )
        );
        const ops = await Promise.all(opsPr);
        const counter = await window.conseiljs.TezosNodeReader.getCounterForAccount(tezosUrl, selectedParentHash);

        const pricedOps = await window.conseiljs.TezosNodeWriter.prepareOperationGroup(tezosUrl, keyStore, counter, ops, true);

        const operationId = await window.conseiljs.TezosNodeWriter.sendOperation(tezosUrl, pricedOps, isLedger, password).catch((err) => {
            const errorObj = { name: err.message, ...err };
            console.error(`Plenty harvestRewards failed with ${JSON.stringify(errorObj)}`);
            dispatch(createMessageAction(errorObj.name, true));
            return undefined;
        });

        if (operationId === undefined) {
            return false;
        }

        dispatch(createMessageAction('components.messageBar.messages.started_token_success', false, operationId?.operationGroupID));

        return true;
    };
}
