import { StakerDAOTokenHelper } from 'conseiljs';

import { Token } from '../../types/general';
import { findTokenIndex } from '../../utils/token';
import { setLocalData } from '../../utils/localData';
import { updateTokensAction } from '../../reduxContent/wallet/actions';
import { getMainNode } from '../../utils/settings';

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
        if (tokens[tokenIndex].kind === 'stkr') {
            const mapid = tokens[tokenIndex].mapid || 0; // TODO: if 0, return empty
            balanceAsync = await StakerDAOTokenHelper.getAccountBalance(mainNode.tezosUrl, mapid, selectedParentHash);
            transAsync = [];
        }

        const [balance, transactions] = await Promise.all([balanceAsync, transAsync]);
        tokens[tokenIndex] = { ...tokens[tokenIndex], balance, transactions };
        setLocalData('tokens', tokens);
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

        const storage = await StakerDAOTokenHelper.getSimpleStorage(mainNode.tezosUrl, tokenAddress);
    };
}
