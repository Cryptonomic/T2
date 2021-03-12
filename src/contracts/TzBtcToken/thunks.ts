import { TzbtcTokenHelper } from 'conseiljs';
import { createMessageAction } from '../../reduxContent/message/actions';
import { updateTokensAction } from '../../reduxContent/wallet/actions';

import { createTokenTransaction } from '../../utils/transaction';
import { TRANSACTION } from '../../constants/TransactionTypes';

import { cloneDecryptedSigner } from '../../utils/wallet';
import { getSelectedKeyStore } from '../../utils/general';
import { getMainNode, getMainPath } from '../../utils/settings';

import { findTokenIndex } from '../../utils/token';

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
