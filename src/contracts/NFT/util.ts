import {
    ConseilQueryBuilder,
    ConseilOperator,
    ConseilSortDirection,
    KeyStore,
    MultiAssetTokenHelper,
    Signer,
    TezosConseilClient,
    TezosMessageUtils,
    TezosNodeReader,
    TezosParameterFormat,
} from 'conseiljs';
import { BigNumber } from 'bignumber.js';
import { JSONPath } from 'jsonpath-plus';
import { proxyFetch, ImageProxyServer, ImageProxyDataType } from 'nft-image-proxy';

import { NFT_ACTION_TYPES, NFT_ERRORS, NFT_PROVIDERS } from './constants';
import { TransferNFTError } from './exceptions';
import { NFTObject, NFTCollections, NFTError, GetNFTCollection, GetNFTCollections } from './types';

import { imageProxyURL, imageAPIKey } from '../../config.json';

import { Node, Token, TokenKind } from '../../types/general';

import { getMainNode } from '../../utils/settings';

const proxySupportedTypes = ['image/png', 'image/apng', 'image/jpeg', 'image/gif'];

/**
 * The last price query.
 *
 * @param {any} operations
 */
function makeLastPriceQuery(operations) {
    let lastPriceQuery = ConseilQueryBuilder.blankQuery();
    lastPriceQuery = ConseilQueryBuilder.addFields(lastPriceQuery, 'timestamp', 'amount', 'operation_group_hash', 'parameters_entrypoints', 'parameters');
    lastPriceQuery = ConseilQueryBuilder.addPredicate(lastPriceQuery, 'kind', ConseilOperator.EQ, ['transaction']);
    lastPriceQuery = ConseilQueryBuilder.addPredicate(lastPriceQuery, 'status', ConseilOperator.EQ, ['applied']);
    lastPriceQuery = ConseilQueryBuilder.addPredicate(lastPriceQuery, 'internal', ConseilOperator.EQ, ['false']);
    lastPriceQuery = ConseilQueryBuilder.addPredicate(
        lastPriceQuery,
        'operation_group_hash',
        operations.length > 1 ? ConseilOperator.IN : ConseilOperator.EQ,
        operations
    );
    lastPriceQuery = ConseilQueryBuilder.setLimit(lastPriceQuery, operations.length);

    return lastPriceQuery;
}

/**
 * Check the proxy for the NFT artifact.
 *
 * @param {string} [artifactUrl]
 * @param {string} [artifactType]
 */
async function getNFTArtifactProxy(artifactUrl?: string | null, artifactType?: string | null): Promise<{ content: string; moderationMessage: string } | null> {
    if (!artifactType || proxySupportedTypes.includes(artifactType) || !artifactUrl || !imageProxyURL) {
        return null;
    }

    const server: ImageProxyServer = { url: imageProxyURL, apikey: imageAPIKey, version: '1.0.0' };
    let content = artifactUrl;
    let moderationMessage = '';

    const response: any = await proxyFetch(server, artifactUrl, ImageProxyDataType.Json, false);
    if (response.rpc_status === 'Ok') {
        if (response.result.moderation_status === 'Allowed') {
            content = response.result.data;
        } else if (response.result.moderation_status === 'Blocked') {
            moderationMessage = `Image was hidden because of it contains the following labels: ${response.result.categories.join(', ')}`;
        }
    }

    return { content, moderationMessage };
}

/**
 * Get the NFT object details.
 *
 * @param {string} tezosUrl - the Tezos URL
 * @param {number} objectId - the object ID
 *
 * @return
 */
export async function getNFTObjectDetails(tezosUrl: string, objectId: number) {
    const packedNftId = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(objectId, 'int'), 'hex'));
    const nftInfo = await TezosNodeReader.getValueForBigMapKey(tezosUrl, 514, packedNftId);
    const ipfsUrlBytes = JSONPath({ path: '$.args[1][0].args[1].bytes', json: nftInfo })[0];
    const ipfsHash = Buffer.from(ipfsUrlBytes, 'hex').toString().slice(7);

    const nftDetails = await fetch(`https://cloudflare-ipfs.com/ipfs/${ipfsHash}`, { cache: 'no-store' });
    const nftDetailJson = await nftDetails.json();

    const nftName = nftDetailJson.name;
    const nftDescription = nftDetailJson.description;
    const nftCreators = nftDetailJson.creators
        .map((c) => c.trim())
        .map((c) => `${c.slice(0, 6)}...${c.slice(c.length - 6, c.length)}`)
        .join(', '); // TODO: use names where possible
    const nftArtifactType = nftDetailJson.formats[0].mimeType.toString();
    let nftArtifact = `https://cloudflare-ipfs.com/ipfs/${nftDetailJson.formats[0].uri.toString().slice(7)}`;
    if (/video|mp4|ogg|webm/.test(nftArtifactType.toLowerCase())) {
        nftArtifact = `https://ipfs.io/ipfs/${nftDetailJson.formats[0].uri.toString().slice(7)}`;
    }
    /**
     * @todo add thumbnail
     */
    // const nftThumbnailUri = `https://ipfs.io/ipfs/${nftDetailJson.thumbnailUri.toString().slice(7)}`;
    const nftThumbnailUri = undefined;

    // Check the proxy:
    let nftArtifactModerationMessage;
    const artifactProxy = await getNFTArtifactProxy(nftArtifact, nftArtifactType);
    if (artifactProxy) {
        nftArtifact = artifactProxy.content;
        nftArtifactModerationMessage = artifactProxy.moderationMessage;
    }

    return {
        name: nftName,
        description: nftDescription,
        creators: nftCreators,
        artifactUrl: nftArtifact,
        artifactType: nftArtifactType,
        artifactModerationMessage: nftArtifactModerationMessage,
        thumbnailUri: nftThumbnailUri,
    };
}

/**
 * Get collections for a given tokens.
 *
 * @param {Token[]} tokens - gets collections for these tokens.
 * @param {string} managerAddress - the manager address.
 * @param {Node} node - the selected node.
 * @param {boolean} [skipDetails=false] - skip fetching the NFT object distance (expensive queries).
 */
export async function getNFTCollections(tokens: Token[], managerAddress: string, node: Node, skipDetails: boolean = false): Promise<GetNFTCollections> {
    // Get collections for given tokens
    const promises: Promise<any>[] = [];
    tokens.map((token) => {
        switch (token.displayName) {
            case 'hic et nunc':
                promises.push(getHicEtNuncCollection(token.mapid, managerAddress, node, skipDetails));
                break;
            case 'Kalamint':
                promises.push(getKalamintCollection(token.mapid, managerAddress, node, skipDetails));
                break;
            default:
                break;
        }
    });

    const responses = await Promise.all(promises);

    // Combine responses:
    let errors: NFTError[] = [];
    let collection: NFTObject[] = [];

    responses.map((response) => {
        if (response.errors && response.errors.length > 0) {
            errors = errors.concat(response.errors);
        }
        if (response.collection && response.collection.length > 0) {
            collection = collection.concat(response.collection);
        }
    });

    return { collections: sortAndGroupCollection(collection), errors };
}

/**
 * Get the NFT collections grouped by type (ie. collected, minted).
 * Each token contains all details.
 *
 * @param {number} tokenMapId
 * @param {string} managerAddress
 * @param {Node} node
 * @param {boolean} [skipDetails=false] - skip fetching the NFT object distance (expensive queries).
 *
 * @return {Promise<GetNFTCollections>} the list of NFT tokens grouped by type and the list of errors.
 */
export async function getHicEtNuncCollection(tokenMapId: number, managerAddress: string, node: Node, skipDetails: boolean = false): Promise<GetNFTCollection> {
    const { conseilUrl, apiKey, network } = node;
    const errors: NFTError[] = []; // Store errors to display to the user.

    // 1. Build and execute the query:
    let collectionQuery = ConseilQueryBuilder.blankQuery();
    collectionQuery = ConseilQueryBuilder.addFields(collectionQuery, 'key', 'value', 'operation_group_id');
    collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'big_map_id', ConseilOperator.EQ, [tokenMapId]);
    collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'key', ConseilOperator.STARTSWITH, [
        `Pair 0x${TezosMessageUtils.writeAddress(managerAddress)}`,
    ]);
    collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'value', ConseilOperator.EQ, [0], true);
    collectionQuery = ConseilQueryBuilder.setLimit(collectionQuery, 10_000);

    const collectionResult = await TezosConseilClient.getTezosEntityData({ url: conseilUrl, apiKey, network }, network, 'big_map_contents', collectionQuery);

    const operationGroupIds = collectionResult.map((r) => r.operation_group_id);
    const queryChunks = chunkArray(operationGroupIds, 30);

    // 2. Get prices:
    const priceQueries = queryChunks.map((c) => makeLastPriceQuery(c));

    const priceMap: any = {};
    await Promise.all(
        priceQueries.map(
            async (q) =>
                await TezosConseilClient.getTezosEntityData({ url: conseilUrl, apiKey, network }, network, 'operations', q).then((result) =>
                    result.map((row) => {
                        let amount = 0;
                        const action = row.parameters_entrypoints;

                        if (action === 'collect') {
                            amount = Number(row.parameters.toString().replace(/^Pair ([0-9]+) [0-9]+/, '$1'));
                        } else if (action === 'transfer') {
                            amount = Number(
                                row.parameters
                                    .toString()
                                    .replace(
                                        /[{] Pair \"[1-9A-HJ-NP-Za-km-z]{36}\" [{] Pair \"[1-9A-HJ-NP-Za-km-z]{36}\" [(]Pair [0-9]+ [0-9]+[)] [}] [}]/,
                                        '$1'
                                    )
                            );
                        }

                        priceMap[row.operation_group_hash] = {
                            price: new BigNumber(row.amount),
                            amount,
                            timestamp: row.timestamp,
                            action,
                        };
                    })
                )
        )
    );

    // 3. Parse tokens to the expected format and fetch missing details:
    const collection = await Promise.all(
        collectionResult.map(async (row) => {
            let price = 0;
            const objectId = new BigNumber(row.key.toString().replace(/.* ([0-9]{1,}$)/, '$1')).toNumber();
            let objectDetails;
            let receivedOn = new Date();
            let action = '';

            try {
                const priceRecord = priceMap[row.operation_group_id];
                price = priceRecord.price.toNumber();
                receivedOn = new Date(priceRecord.timestamp);
                action = priceRecord.action === 'collect' ? NFT_ACTION_TYPES.COLLECTED : NFT_ACTION_TYPES.MINTED;
            } catch {
                //
            }

            let nftObject = {
                objectId,
                provider: NFT_PROVIDERS.HIC_ET_NUNC,
                amount: Number(row.value),
                price: isNaN(price) ? 0 : price,
                receivedOn,
                action,
            } as NFTObject;

            // Get the other object details, like name, description, artifactUrl, etc.
            if (!skipDetails) {
                try {
                    objectDetails = await getNFTObjectDetails(node.tezosUrl, objectId);

                    nftObject = {
                        ...nftObject,
                        name: objectDetails.name,
                        description: objectDetails.description,
                        artifactUrl: objectDetails.artifactUrl,
                        artifactType: objectDetails.artifactType,
                        artifactModerationMessage: objectDetails.artifactModerationMessage,
                        thumbnailUri: objectDetails.thumbnailUri,
                        creators: objectDetails.creators,
                        author: objectDetails.creators,
                    };
                } catch {
                    //
                }
            }

            return nftObject;
        })
    );

    /**
     * Fake errors:
     */
    // if (true) {
    //     throw 'Some fake error!';
    // }

    // errors.push(
    //     {
    //         code: NFT_ERRORS.SOMETHING_WENT_WRONG
    //     }
    // );
    errors.push({
        code: NFT_ERRORS.UNSUPPORTED_PROVIDER,
        data: [
            {
                key: 'provider',
                value: 'Hic et nunc 22',
            },
        ],
    });
    errors.push({
        code: NFT_ERRORS.UNSUPPORTED_DATA_FORMAT,
        data: [
            {
                key: 'field',
                translate_value: 'components.nftGallery.fields.artifactUrl',
            },
            {
                key: 'provider',
                value: 'Hic et nunc',
            },
        ],
    });
    /* END: Fake errors */

    // 5. Return the response:
    return { collection, errors };
}

/**
 * Get the Kalamint collection.
 * @param tokenMapId
 * @param managerAddress
 * @param node
 * @param {boolean} [skipDetails=false] - skip fetching the NFT object distance (expensive queries).
 */
export async function getKalamintCollection(tokenMapId: number, managerAddress: string, node: Node, skipDetails: boolean = false): Promise<GetNFTCollections> {
    /**
     * @todo add fetching Kalamint collection
     */
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({
                collections: {
                    collected: [],
                    minted: [],
                },
                errors: [],
            });
        }, 300);
    });
}

/**
 * Get the NFT token info
 *
 * @param {Node} node
 * @param {number} mapId
 */
export async function getTokenInfo(node: Node, mapId: number = 515): Promise<{ holders: number; totalBalance: number }> {
    const { conseilUrl, apiKey, network } = node;

    let holdersQuery = ConseilQueryBuilder.blankQuery();
    holdersQuery = ConseilQueryBuilder.addFields(holdersQuery, 'value');
    holdersQuery = ConseilQueryBuilder.addPredicate(holdersQuery, 'big_map_id', ConseilOperator.EQ, [mapId]);
    holdersQuery = ConseilQueryBuilder.setLimit(holdersQuery, 20_000);

    const holdersResult = await TezosConseilClient.getTezosEntityData({ url: conseilUrl, apiKey, network }, network, 'big_map_contents', holdersQuery);

    let holders = 0;
    let totalBalance = new BigNumber(0);
    holdersResult.forEach((r) => {
        try {
            const balance = new BigNumber(r.value);
            if (balance.isGreaterThan(0)) {
                totalBalance = totalBalance.plus(balance);
            }
            holders++;
        } catch {
            // eh
        }
    });

    return { holders, totalBalance: totalBalance.toNumber() };
}

/**
 * Transfer the NFT object to the given address.
 *
 * @param {string} server - Tezos URL
 * @param {string} address - token address
 * @param {Signer} signer - the signer
 * @param {KeyStore} keystore - the keystore
 * @param {number} fee - the fee
 * @param {string} source - the source hash
 * @param {TransferPair[]} transfers - list of transfers containing address, tokenid and amount.
 * @param {number} [gas] - the gas
 * @param {number} [freight] - the storage
 */
export async function transferNFT(
    server: string,
    address: string,
    signer: Signer,
    keystore: KeyStore,
    fee: number,
    source: string,
    transfers: {
        address: string;
        tokenid: number;
        amount: number;
    }[],
    gas?: number,
    freight?: number
): Promise<string> {
    /** MOCK */
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('some_operation_id');
            // reject(new TransferNFTError('components.messageBar.messages.nft_send_transaction_failed', transfers))
        }, 300);
    });
    /** END MOCK */

    // try {
    //     return await MultiAssetTokenHelper.transfer(
    //         server,
    //         address,
    //         signer,
    //         keystore,
    //         fee,
    //         source,
    //         transfers,
    //         gas,
    //         freight
    //     );
    // } catch(err) {
    //     throw new TransferNFTError('components.messageBar.messages.nft_send_transaction_failed', transfers);
    // }
}

/**
 * Get the NFT collection size.
 * If you need a collection size for a specific token, pass the one-element array, ie: [token].
 *
 * @param {Token} tokens - the list of tokens
 * @param {string} managerAddress - manager address
 * @param {Node} node - selected node
 *
 * @return {Promise<number>}
 */
export async function getCollectionSize(tokens: Token[], managerAddress: string, node: Node): Promise<number> {
    const { collections } = await getNFTCollections(tokens, managerAddress, node);
    const tokenCount = collections.collected.reduce((a, c) => a + c.amount, 0) + collections.minted.reduce((a, c) => a + c.amount, 0);

    return tokenCount;
}

/**
 * Chunk the array
 * @param {any[]} arr - any array
 * @param {number} len - the chunk size
 */
function chunkArray(arr: any[], len: number) {
    const chunks: any[] = [];
    const n = arr.length;

    let i = 0;
    while (i < n) {
        chunks.push(arr.slice(i, (i += len)));
    }

    return chunks;
}

/**
 * Sort and group into [minted, collected, etc.] the collection of NFT objects
 * @param {NFTObject[]} objects
 */
function sortAndGroupCollection(objects: NFTObject[]) {
    const sorted = objects.sort((a, b) => b.receivedOn.getTime() - a.receivedOn.getTime());
    const grouped: NFTCollections = {
        collected: [] as NFTObject[],
        minted: [] as NFTObject[],
    };

    sorted.map((token, index) => {
        if (token.action === NFT_ACTION_TYPES.MINTED) {
            grouped.minted.push(token);
        } else {
            grouped.collected.push(token);
        }
    });

    return grouped;
}
