import { WrappedTezosHelper, TezosNodeReader } from 'conseiljs';
import { createMessageAction } from '../../reduxContent/message/actions';
import { updateOvensAction, updateTokensAction } from '../../reduxContent/wallet/actions';

import { createTokenTransaction } from '../../utils/transaction';
import { TRANSACTION } from '../../constants/TransactionTypes';

import { getSelectedKeyStore } from '../../utils/general';
import { getMainNode, getMainPath } from '../../utils/settings';

import { findTokenIndex } from '../../utils/token';
import { Oven } from '../../types/general';

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

export function listOvens() {
    return async (dispatch, state) => {
        const { selectedNode, nodesList, selectedPath, pathsList } = state().settings;
        const { identities, walletPassword, tokens } = state().wallet;
        const { selectedAccountHash, selectedParentHash, isLedger, signer } = state().app;
        const mainNode = getMainNode(nodesList, selectedNode);
        const { tezosUrl } = mainNode;

        const mainPath = getMainPath(pathsList, selectedPath);
        const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger, mainPath);

        // TODO(keefertaylor): Do not hardcode these.
        const coreContractAddress = 'KT1S98ELFTo6mdMBqhAVbGgKAVgLbdPP3AX8';
        const ovenListBigMapId = 14569;

        const ovenAddresses = await WrappedTezosHelper.listOvens(tezosUrl, coreContractAddress, selectedParentHash, ovenListBigMapId);

        const ovens: Oven[] = await Promise.all(
            ovenAddresses.map(async (ovenAddress) => {
                // TODO(keefertaylor): Fetch a baker when Conseil supports it.
                const baker = '';
                const ovenBalance = await TezosNodeReader.getSpendableBalanceForAccount(tezosUrl, ovenAddress);

                return {
                    ovenAddress,
                    ovenOwner: selectedParentHash,
                    baker,
                    ovenBalance,
                };
            })
        );

        dispatch(updateOvensAction(ovens));

        return true;
    };
}
