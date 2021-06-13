import { useState, useEffect } from 'react';
import { useStore } from 'react-redux';

import { MultiAssetTokenHelper } from 'conseiljs';

import { RootState } from '../../types/store';

import { createMessageAction } from '../../reduxContent/message/actions';
import { updateTokensAction } from '../../reduxContent/wallet/actions';

import { TRANSACTION } from '../../constants/TransactionTypes';

import { createTokenTransaction } from '../../utils/transaction';
import { getSelectedKeyStore } from '../../utils/general';
import { getMainNode, getMainPath } from '../../utils/settings';
import { findTokenIndex } from '../../utils/token';
import { cloneDecryptedSigner } from '../../utils/wallet';

import { ArtToken, Token, TokenKind } from '../../types/general';

import * as HicNFTUtil from './util';

export function transferThunk(destination: string, amount: number, tokenid: number, password: string, fee: number = 0, gas: number = 0, storage: number = 0) {
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

        const operationId = await MultiAssetTokenHelper.transfer(
            tezosUrl,
            selectedAccountHash,
            isLedger ? signer : await cloneDecryptedSigner(signer, password),
            keyStore,
            fee,
            selectedParentHash,
            [{ address: destination, tokenid, amount }],
            gas,
            storage
        ).catch((err) => {
            const errorObj = { name: err.message, ...err };
            console.error(`transferThunk/MultiAssetTokenHelper failed with ${JSON.stringify(errorObj)}`);
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
            // in the token list in the config
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
            balanceAsync = await HicNFTUtil.getCollectionSize(mapid, selectedParentHash, selectedNode);
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

export function getCollection() {
    const store = useStore<RootState>();
    const [collection, setCollection] = useState<any[]>([]);

    useEffect(() => {
        const _getCollection = async () => {
            const { selectedNode, nodesList } = store.getState().settings;
            const { selectedParentHash } = store.getState().app;
            const mainNode = getMainNode(nodesList, selectedNode);

            setCollection(await HicNFTUtil.getCollection(511, selectedParentHash, mainNode));
        };

        _getCollection();
    }, []);

    return collection;
}

export function getBalance() {
    const store = useStore<RootState>();
    const [balance, setBalance] = useState<number>(0);

    useEffect(() => {
        const _getBalance = async () => {
            const { selectedNode, nodesList } = store.getState().settings;
            const { selectedParentHash } = store.getState().app;
            const mainNode = getMainNode(nodesList, selectedNode);

            setBalance(await HicNFTUtil.getBalance(mainNode.tezosUrl, 515, selectedParentHash));
        };

        _getBalance();
    }, []);

    return balance;
}

export function getPieceInfo(objectId: number) {
    const store = useStore<RootState>();
    const [pieceInfo, setPieceInfo] = useState<any>({});

    useEffect(() => {
        const _getPieceInfo = async () => {
            const { selectedNode, nodesList } = store.getState().settings;
            const mainNode = getMainNode(nodesList, selectedNode);

            setPieceInfo(await HicNFTUtil.getNFTObjectDetails(mainNode.tezosUrl, objectId));
        };

        _getPieceInfo();
    }, []);

    return pieceInfo;
}
