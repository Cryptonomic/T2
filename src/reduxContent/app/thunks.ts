import {
  ConseilQueryBuilder,
  ConseilOperator,
  ConseilDataClient,
  ConseilSortDirection,
  TezosConseilClient,
  TezosNodeReader
} from 'conseiljs';
import { getMainNode } from '../../utils/settings';

const { executeEntityQuery } = ConseilDataClient;

export function fetchFeesThunk(operationKind) {
  return async (dispatch, state) => {
    const { selectedNode, nodesList } = state().settings;
    const mainNode = getMainNode(nodesList, selectedNode);
    const { conseilUrl, apiKey, network } = mainNode;
    const fees = await TezosConseilClient.getFeeStatistics(
      { url: conseilUrl, apiKey, network },
      network,
      operationKind
    );
    console.log('thunkfeess---', fees);
    return fees[0];
  };
}

export function getAccountThunk(pkh: string) {
  return async (dispatch, state) => {
    const { selectedNode, nodesList } = state().settings;
    const mainNode = getMainNode(nodesList, selectedNode);
    const { conseilUrl, apiKey, network, platform } = mainNode;
    const serverInfo = { url: conseilUrl, apiKey, network };

    let query = ConseilQueryBuilder.blankQuery();
    query = ConseilQueryBuilder.addFields(query, 'script');
    query = ConseilQueryBuilder.addPredicate(query, 'account_id', ConseilOperator.EQ, [pkh], false);
    query = ConseilQueryBuilder.addOrdering(query, 'script', ConseilSortDirection.DESC);
    query = ConseilQueryBuilder.setLimit(query, 1);

    const account = await executeEntityQuery(
      serverInfo,
      platform,
      network,
      'accounts',
      query
    ).catch(() => []);
    return account;
  };
}

export function getIsRevealThunk(isManager: boolean = false) {
  return async (dispatch, state) => {
    const { selectedNode, nodesList } = state().settings;
    const mainNode = getMainNode(nodesList, selectedNode);
    const { tezosUrl } = mainNode;
    const { selectedAccountHash, selectedParentHash } = state().app;
    const pkh = isManager ? selectedParentHash : selectedAccountHash;
    const isReveal = await TezosNodeReader.isManagerKeyRevealedForAccount(tezosUrl, pkh);
    return isReveal;
  };
}

export function getIsImplicitAndEmptyThunk(recipientHash: string) {
  return async (dispatch, state) => {
    const { selectedNode, nodesList } = state().settings;
    const mainNode = getMainNode(nodesList, selectedNode);
    const { tezosUrl } = mainNode;
    const isImplicitAndEmpty = await TezosNodeReader.isImplicitAndEmpty(tezosUrl, recipientHash);
    return isImplicitAndEmpty;
  };
}
