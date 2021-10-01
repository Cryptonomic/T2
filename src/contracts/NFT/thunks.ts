import { useState, useEffect } from 'react';
import { useStore } from 'react-redux';

import { NFT_ERRORS } from './constants';
import { TransferNFTError } from './exceptions';
import * as NFTUtil from './util';
import { NFTCollections, NFTObject, NFTError, GetNFTCollectionResponse } from './types';

import { knownTokenContracts } from '../../constants/Token';

import { RootState } from '../../types/store';

import { getSelectedKeyStore } from '../../utils/general';
import { getMainNode, getMainPath } from '../../utils/settings';
import { cloneDecryptedSigner } from '../../utils/wallet';

import { createMessageAction } from '../../reduxContent/message/actions';
import { syncWalletThunk } from '../../reduxContent/wallet/thunks';

/**
 * Sync the NFT.
 */
export const syncWallet = () => (dispatch) => {
    /**
     * @todo the sync action
     */
    dispatch(syncWalletThunk());
};

/**
 * Get NFT Collections grouped by the action type (ie. collected, minted).
 *
 * Returns:
 * - collections - list of NFT objects grouped by the action type,
 * - loading - is the fetching request pending?
 * - errors - list of errors.
 *
 * @return {GetNFTCollectionResponse}
 */
export function getNFTCollections(): GetNFTCollectionResponse {
    const store = useStore<RootState>();
    const [errors, setErrors] = useState<NFTError[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [collections, setCollections] = useState<NFTCollections>({
        collected: [] as NFTObject[],
        minted: [] as NFTObject[],
    });

    useEffect(() => {
        const _getCollection = async () => {
            const { selectedNode, nodesList } = store.getState().settings;
            const { selectedParentHash } = store.getState().app;
            const mainNode = getMainNode(nodesList, selectedNode);

            try {
                const response = await NFTUtil.getCollections(511, selectedParentHash, mainNode);
                setCollections(response.collections);
                setErrors(response.errors);
                setLoading(false);
            } catch (e) {
                setErrors([
                    {
                        code: NFT_ERRORS.SOMETHING_WENT_WRONG,
                    },
                ]);
                setLoading(false);
            }
        };

        _getCollection();
    }, []);

    return { collections, loading, errors };
}

/**
 * Transfer the NFT token.
 *
 * @param {string} destination - the address
 * @param {number} amount - the number of tokens
 * @param {number} tokenid - the object ID
 * @param {string} password - the wallet password
 * @param {number} [fee] - the fee
 * @param {number} [gas] - the gas
 * @param {number} storage - the freight
 *
 * @return {Promise<boolean>}
 */
export const transferNFT = (
    destination: string,
    amount: number,
    tokenid: number,
    password: string,
    fee: number = 0,
    gas: number = 0,
    storage: number = 0
) => async (dispatch, state): Promise<boolean> => {
    const { selectedNode, nodesList, selectedPath, pathsList } = state().settings;
    const { identities, walletPassword, tokens } = state().wallet;
    const { selectedParentHash, isLedger, signer } = state().app;
    const mainNode = getMainNode(nodesList, selectedNode);
    const { tezosUrl } = mainNode;

    const tokenAddress = knownTokenContracts.find((t) => t.displayName.toLowerCase() === 'hic et nunc')?.address || '';

    if (password !== walletPassword && !isLedger) {
        const error = 'components.messageBar.messages.incorrect_password';
        dispatch(createMessageAction(error, true));
        return false;
    }

    const mainPath = getMainPath(pathsList, selectedPath);
    const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger, mainPath);

    try {
        const theSigner = isLedger ? signer : await cloneDecryptedSigner(signer, password);

        const operationId = await NFTUtil.transferNFT(
            tezosUrl,
            tokenAddress,
            theSigner,
            keyStore,
            fee,
            selectedParentHash,
            [{ address: destination, tokenid, amount }],
            gas,
            storage
        );

        dispatch(createMessageAction('components.messageBar.messages.started_token_success', false, operationId));

        // const transaction = createTokenTransaction({
        //     amount,
        //     destination,
        //     kind: TRANSACTION,
        //     source: selectedParentHash,
        //     operation_group_hash: operationId,
        //     fee,
        // });

        // const tokenIndex = findTokenIndex(tokens, tokenAddress);

        // if (tokenIndex > -1) {
        //     // in the token list in the config
        //     tokens[tokenIndex].transactions.push(transaction);
        // }

        // dispatch(updateTokensAction([...tokens]));

        return true;
    } catch (err) {
        if (err instanceof TransferNFTError) {
            console.error(`transferNFT/MultiAssetTokenHelper failed with ${JSON.stringify(err)}`);
            dispatch(createMessageAction(err.message, true));
        } else {
            const errorObj = { name: err.message, ...err };
            console.error(`transferNFT failed with ${JSON.stringify(errorObj)}`);
            dispatch(createMessageAction(errorObj.name, true));
        }

        return false;
    }
};
