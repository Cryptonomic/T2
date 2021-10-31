import { MultiAssetTokenHelper, SingleAssetTokenHelper } from 'conseiljs';
import { createMessageAction } from '../../reduxContent/message/actions';
import { updateTokensAction } from '../../reduxContent/wallet/actions';

import { createTransaction, createTokenTransaction } from '../../utils/transaction';
import { TRANSACTION } from '../../constants/TransactionTypes';

import { cloneDecryptedSigner } from '../../utils/wallet';
import { getSelectedKeyStore } from '../../utils/general';
import { getMainNode, getMainPath } from '../../utils/settings';

import { findTokenIndex } from '../../utils/token';
import { knownContractNames, knownTokenContracts, knownMarketMetadata } from '../../constants/Token';
import { TokenKind } from '../../types/general';
import { mintYV, burnYV } from './util';

export function transferThunk(tokenAddress: string, tokenIndex: number | undefined, destination: string, amount: number, fee: number, password: string) {
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
        const token = knownTokenContracts.find((t) => t.address === selectedAccountHash);

        let operationId: string | undefined = '';
        if (token !== undefined && tokenIndex !== undefined) {
            operationId = await MultiAssetTokenHelper.transfer(
                tezosUrl,
                tokenAddress,
                isLedger ? signer : await cloneDecryptedSigner(signer, password),
                keyStore,
                fee,
                [{ source: selectedParentHash, txs: [{ destination, token_id: tokenIndex, amount }] }],
                0,
                0
            ).catch((err) => {
                const errorObj = { name: err.message, ...err };
                console.error(`transferThunk/MultiAssetTokenHelper failed with ${JSON.stringify(errorObj)}`);
                dispatch(createMessageAction(errorObj.name, true));
                return undefined;
            });
        } else if (token !== undefined) {
            operationId = await SingleAssetTokenHelper.transfer(
                tezosUrl,
                selectedAccountHash,
                isLedger ? signer : await cloneDecryptedSigner(signer, password),
                keyStore,
                fee,
                selectedParentHash,
                [{ address: destination, amount }],
                0,
                0
            ).catch((err) => {
                const errorObj = { name: err.message, ...err };
                console.error(`transferThunk/SingleAssetTokenHelper failed with ${JSON.stringify(errorObj)}`);
                dispatch(createMessageAction(errorObj.name, true));
                return undefined;
            });
        }

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

        dispatch(updateTokensAction([...tokens]));
        return true;
    };
}

export function mintThunk(destination: string, amount: number, fee: number, password: string) {
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

        const idx = findTokenIndex(tokens, selectedAccountHash);
        const selectedToken = tokens[idx];

        const mainPath = getMainPath(pathsList, selectedPath);

        const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger, mainPath);

        let groupid = '';
        if (selectedToken.symbol.toLowerCase() === 'btctz') {
            // Not meant for initial mint
            groupid = await mintYV(
                tezosUrl,
                selectedAccountHash,
                isLedger ? signer : await cloneDecryptedSigner(signer, password),
                keyStore,
                fee,
                destination,
                amount
            ).catch((err) => {
                console.log(err);
                const errorObj = { name: err.message, ...err };
                console.error(errorObj);
                dispatch(createMessageAction(errorObj.name, true));
                return '';
            });
        } else if (selectedToken.kind === TokenKind.tzip12 && selectedToken.tokenIndex === undefined) {
            // SingleAssetTokenHelper.mint() TODO
        } else if (selectedToken.kind === TokenKind.tzip12 && selectedToken.tokenIndex > -1) {
            // MultiAssetTokenHelper.mint() TODO
        }

        if (groupid.length === 0) {
            return false;
        }

        dispatch(createMessageAction('components.messageBar.messages.mint_operation_success', false, groupid));

        const transaction = createTransaction({
            amount,
            destination,
            kind: TRANSACTION,
            source: keyStore.publicKeyHash,
            operation_group_hash: groupid,
            fee,
            entryPoint: 'mint',
        });

        selectedToken.transactions.push(transaction);

        dispatch(updateTokensAction([...tokens]));

        return true;
    };
}

export function burnThunk(destination: string, amount: number, fee: number, password: string) {
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

        const idx = findTokenIndex(tokens, selectedAccountHash);
        const selectedToken = tokens[idx];

        let groupid = '';
        if (selectedToken.symbol.toLowerCase() === 'btctz' || selectedToken.symbol.toLowerCase() === 'oldbtctz') {
            groupid = await burnYV(
                tezosUrl,
                selectedAccountHash,
                isLedger ? signer : await cloneDecryptedSigner(signer, password),
                keyStore,
                fee,
                destination,
                amount
            ).catch((err) => {
                const errorObj = { name: err.message, ...err };
                console.error(errorObj);
                dispatch(createMessageAction(errorObj.name, true));
                return '';
            });
        } else if (selectedToken.kind === TokenKind.tzip12 && selectedToken.tokenIndex === undefined) {
            // SingleAssetTokenHelper.mint()
        } else if (selectedToken.kind === TokenKind.tzip12 && selectedToken.tokenIndex > -1) {
            // MultiAssetTokenHelper.mint()
        }

        if (groupid.length === 0) {
            return false;
        }

        dispatch(createMessageAction('components.messageBar.messages.burn_operation_success', false, groupid));

        const transaction = createTransaction({
            amount: amount * -1,
            destination,
            kind: TRANSACTION,
            source: keyStore.publicKeyHash,
            operation_group_hash: groupid,
            fee,
            entryPoint: 'burn',
        });

        selectedToken.transactions.push(transaction);

        dispatch(updateTokensAction([...tokens]));

        return true;
    };
}
