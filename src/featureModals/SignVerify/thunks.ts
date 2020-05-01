import { ConseilDataClient, ConseilQueryBuilder, ConseilOperator } from 'conseiljs';
import { getMainNode } from '../../utils/settings';

export function publicKeyThunk(address: string) {
    return async (dispatch, state): Promise<string> => {
        const { selectedNode, nodesList } = state().settings;
        const mainNode = getMainNode(nodesList, selectedNode);
        const { network, conseilUrl, apiKey } = mainNode;

        const serverInfo = { url: conseilUrl, apiKey, network };

        let publicKeyQuery = ConseilQueryBuilder.blankQuery();
        publicKeyQuery = ConseilQueryBuilder.addFields(publicKeyQuery, 'public_key');
        publicKeyQuery = ConseilQueryBuilder.addPredicate(publicKeyQuery, 'kind', ConseilOperator.EQ, ['reveal'], false);
        publicKeyQuery = ConseilQueryBuilder.addPredicate(publicKeyQuery, 'status', ConseilOperator.EQ, ['applied'], false);
        publicKeyQuery = ConseilQueryBuilder.addPredicate(publicKeyQuery, 'source', ConseilOperator.EQ, [address], false);
        publicKeyQuery = ConseilQueryBuilder.setLimit(publicKeyQuery, 1);

        try {
            return (await ConseilDataClient.executeEntityQuery(serverInfo, 'tezos', network, 'operations', publicKeyQuery))[0]?.public_key;
        } catch (e) {
            throw Error('Public key not revealed on chain.');
        }
    };
}

export default publicKeyThunk;
