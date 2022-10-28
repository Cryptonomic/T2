import { TransferNFTError } from './exceptions';
import * as NFTUtil from './util';

import { knownTokenContracts } from '../../constants/Token';

import { getSelectedKeyStore } from '../../utils/general';
import { getMainNode, getMainPath } from '../../utils/settings';
import { cloneDecryptedSigner } from '../../utils/wallet';

import { createMessageAction } from '../../reduxContent/message/actions';

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
    tokenAddress: string,
    destination: string,
    amount: number,
    tokenid: number | string,
    password: string,
    fee: number = 0,
    gas: number = 0,
    storage: number = 0
) => async (dispatch, state): Promise<boolean> => {
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
