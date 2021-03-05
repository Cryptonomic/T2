import { Tzip7ReferenceTokenHelper } from 'conseiljs';
import { createMessageAction } from '../../reduxContent/message/actions';
import { updateTokensAction } from '../../reduxContent/wallet/actions';

import { createTransaction, createTokenTransaction } from '../../utils/transaction';
import { TRANSACTION } from '../../constants/TransactionTypes';

import { getSelectedKeyStore } from '../../utils/general';
import { getMainNode, getMainPath } from '../../utils/settings';

import { ArtToken, Token, TokenKind } from '../../types/general';

import { findTokenIndex } from '../../utils/token';

import { getCollectionSize } from './util';

const { transferBalance, mint, burn } = Tzip7ReferenceTokenHelper;

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

        const operationId: string | undefined = await transferBalance(
            tezosUrl,
            signer,
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

export function syncTokenTransactions(tokenAddress) {
    return async (dispatch, state) => {
        const { selectedNode, nodesList } = state().settings;
        const { selectedParentHash } = state().app;
        const tokens: Token[] = state().wallet.tokens;
        const mainNode = getMainNode(nodesList, selectedNode);
        const tokenIndex = findTokenIndex(tokens, tokenAddress);

        if (tokenIndex < 0) {
            return;
        }

        let balanceAsync;
        let transAsync;
        if (tokens[tokenIndex].kind === TokenKind.objkt) {
            const mapid = tokens[tokenIndex].mapid || -1; // TODO: if -1, return empty
            balanceAsync = await getCollectionSize(511, selectedParentHash, selectedNode);
            transAsync = [];
        }

        const [balance, transactions] = await Promise.all([balanceAsync, transAsync]);
        tokens[tokenIndex] = { ...tokens[tokenIndex], balance, transactions };

        dispatch(updateTokensAction([...tokens]));
    };
}

export function getTokenAttributes(tokenAddress) {
    return async (dispatch, state) => {
        const { selectedNode, nodesList } = state().settings;
        const tokens: Token[] = state().wallet.tokens;

        const mainNode = getMainNode(nodesList, selectedNode);
        const tokenIndex = findTokenIndex(tokens, tokenAddress);

        if (tokenIndex < 0) {
            return;
        }

        // const storage = await StakerDAOTokenHelper.getSimpleStorage(mainNode.tezosUrl, tokenAddress);
    };
}
