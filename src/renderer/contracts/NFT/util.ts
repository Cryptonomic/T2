import { ConseilQueryBuilder, ConseilOperator, KeyStore } from 'conseiljs';
import { BigNumber } from 'bignumber.js';
import { JSONPath } from 'jsonpath-plus';
import { proxyFetch, ImageProxyServer, ImageProxyDataType } from 'nft-image-proxy';
// import * as png from 'pngjs';

import { NFT_ACTION_TYPES, NFT_ERRORS, NFT_PROVIDERS } from './constants';
import { TransferNFTError } from './exceptions';
import { NFTObject, NFTCollections, NFTError, GetNFTCollection, GetNFTCollections } from './types';

import config from '../../config.json';

import { ArtToken, Node, TokenKind } from '../../types/general';

const { imageProxyURL, imageAPIKey } = config;

const proxySupportedTypes = ['image/png', 'image/apng', 'image/jpeg', 'image/gif'];
const GenesisBlockTime = new Date(2018, 5, 30, 12, 7, 32);

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
    if (!artifactType || !proxySupportedTypes.includes(artifactType) || !artifactUrl || !imageProxyURL) {
        if (artifactType && !proxySupportedTypes.includes(artifactType)) {
            console.warn(`image proxy doesn't support ${artifactType} on ${artifactUrl}`);
        }
        return null;
    }

    const server: ImageProxyServer = { url: imageProxyURL, apikey: imageAPIKey, version: '1.0.0' };
    let content = artifactUrl;
    let moderationMessage = '';
    let timeout = true;

    const fetchPromise = proxyFetch(server, artifactUrl, ImageProxyDataType.Json, false)
        .then((response: any) => {
            if (response.rpc_status === 'Ok') {
                if (response.result.moderation_status === 'Allowed') {
                    content = response.result.data;
                } else if (response.result.moderation_status === 'Blocked') {
                    moderationMessage = `Image was hidden due to: ${response.result.categories.join(', ')}`;
                }
                if (content.length < 1000) {
                    console.warn(`image proxy is likely missing ${artifactUrl}`);
                } else {
                    console.info(`image proxy returned ${artifactUrl}`);
                }
            } else if (response.error) {
                console.error(`image proxy error for ${artifactUrl}`, response.error.reason);
            } else {
                console.error(`image proxy error for ${artifactUrl}`);
            }

            timeout = false;

            return { content, moderationMessage };
        })
        .catch((err) => {
            timeout = false;
            console.error(`failed to query image proxy for ${artifactUrl}`, err);
            return { content, moderationMessage };
        });

    const fakePromise = new Promise(() => {
        setTimeout(() => {
            if (timeout) {
                console.log(`image proxy timeout for ${artifactUrl}`);
            }
        }, 20_000);
    }).then(() => {
        return { content, moderationMessage };
    });

    return Promise.race([fetchPromise, fakePromise]);
}

/**
 * Get the NFT object details.
 *
 * @param {string} tezosUrl - the Tezos URL
 * @param {number} objectId - the object ID
 *
 * @return
 */
export async function getHENNFTObjectDetails(tezosUrl: string, objectId: number) {
    const packedNftId = await window.conseiljs.TezosMessageUtils.encodeBigMapKey(objectId, 'int', 'hex');
    const nftInfo = await window.conseiljs.TezosNodeReader.getValueForBigMapKey(tezosUrl, 514, packedNftId);
    const ipfsUrlBytes = JSONPath({ path: '$.args[1][0].args[1].bytes', json: nftInfo })[0];
    const ipfsHash = window.electron.buffer.fromString(ipfsUrlBytes, 'hex').slice(7);
    // Todo
    const nftDetailJson = await window.electron.fetch(`https://cloudflare-ipfs.com/ipfs/${ipfsHash}`, { cache: 'no-store' });
    // const nftDetailJson = await nftDetails.json();

    const nftName = nftDetailJson.name;
    const nftDescription = nftDetailJson.description;
    const nftCreators = nftDetailJson.creators
        .map((c) => c.trim())
        .map((c) => `${c.slice(0, 6)}...${c.slice(c.length - 6, c.length)}`)
        .join(', '); // TODO: use names where possible
    const nftArtifactType = nftDetailJson.formats[0].mimeType.toString();
    let nftArtifact = nftDetailJson.formats[0].uri.toString();
    /**
     * @todo add thumbnail
     */
    // const nftThumbnailUri = `https://ipfs.io/ipfs/${nftDetailJson.thumbnailUri.toString().slice(7)}`;
    const nftThumbnailUri = undefined;

    // Check the proxy:
    let nftArtifactModerationMessage;
    const artifactProxy = await getNFTArtifactProxy(nftArtifact, nftArtifactType);
    if (artifactProxy && artifactProxy.content.length > 1000) {
        nftArtifact = artifactProxy.content;
        nftArtifactModerationMessage = artifactProxy.moderationMessage;
    } else if (/video|mp4|ogg|webm/.test(nftArtifactType.toLowerCase())) {
        nftArtifact = `https://ipfs.io/ipfs/${nftDetailJson.formats[0].uri.toString().slice(7)}`;
    } else {
        nftArtifact = `https://cloudflare-ipfs.com/ipfs/${nftDetailJson.formats[0].uri.toString().slice(7)}`;
        console.log(`could not fetch NFT content from proxy, using ${nftArtifact}`);
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

export async function getKalamintNFTObjectDetails(tezosUrl: string, objectId: number) {
    const packedNftId = await window.conseiljs.TezosMessageUtils.encodeBigMapKey(objectId, 'int', 'hex');
    const nftInfo = await window.conseiljs.TezosNodeReader.getValueForBigMapKey(tezosUrl, 860, packedNftId);
    const ipfsUrlBytes = JSONPath({ path: '$.args[1][0].args[1].bytes', json: nftInfo })[0];
    const ipfsHash = window.electron.buffer.fromString(ipfsUrlBytes, 'hex').slice(7);
    // Todo Joe
    const nftDetailJson = await window.electron.fetch(`https://cloudflare-ipfs.com/ipfs/${ipfsHash}`, { cache: 'no-store' });
    // const nftDetailJson = await nftDetails.json();

    const nftName = nftDetailJson.name;
    const nftDescription = nftDetailJson.description;
    const nftCreators = nftDetailJson.creators
        .map((c) => c.trim())
        .map((c) => `${c.slice(0, 6)}...${c.slice(c.length - 6, c.length)}`)
        .join(', '); // TODO: use names where possible
    const nftArtifactType = 'image/png'; // HACK: no mime type in kalamint metadata

    let nftArtifact = nftDetailJson.artifactUri;
    const nftThumbnailUri = `https://ipfs.io/ipfs/${nftDetailJson.thumbnailUri.slice(7)}`;

    // Check the proxy:
    let nftArtifactModerationMessage;
    const artifactProxy = await getNFTArtifactProxy(nftArtifact, nftArtifactType);
    if (artifactProxy && artifactProxy.content.length > 1000) {
        // content returned from proxy directly
        nftArtifact = artifactProxy.content;
        nftArtifactModerationMessage = artifactProxy.moderationMessage;
    } else {
        nftArtifact = makeUrl(nftDetailJson.artifactUri.toString());
        console.log(`could not fetch NFT content from proxy, using ${nftArtifact}`);
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
export async function getNFTCollections(
    tokens: ArtToken[],
    managerAddress: string,
    node: Node,
    skipDetails = false,
    dateBoundary?: Date
): Promise<GetNFTCollections> {
    const promises: Promise<any>[] = [];
    tokens.forEach((token) => {
        switch (token.displayName.toLowerCase()) {
            case 'hic et nunc':
                promises.push(getHicEtNuncCollection(token.address, token.mapid, managerAddress, node, skipDetails, dateBoundary));
                break;
            case 'kalamint':
                promises.push(getKalamintCollection(token.address, token.mapid, managerAddress, node, skipDetails, dateBoundary));
                break;
            case 'pixelpotus':
                promises.push(getPotusCollection(token.address, token.mapid, managerAddress, node, skipDetails, dateBoundary));
                break;
            case 'hash three points':
                promises.push(getHashThreeCollection(token.address, token.mapid, managerAddress, node, skipDetails, dateBoundary));
                break;

            default:
                try {
                    promises.push(
                        getCollection(
                            token.address,
                            token.mapid,
                            token.holderLocation || 'key',
                            token.nftMetadataMap,
                            token.provider || '',
                            managerAddress,
                            node,
                            skipDetails,
                            undefined,
                            dateBoundary
                        )
                    );
                } catch (err) {
                    console.log(`could not fetch collection for ${token.address}`);
                }
                break;
        }
    });

    const responses = await Promise.all(promises);

    // Combine responses:
    let errors: NFTError[] = [];
    let collection: NFTObject[] = [];

    responses.forEach((response) => {
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
export async function getHicEtNuncCollection(
    tokenAddress: string,
    tokenMapId: number,
    managerAddress: string,
    node: Node,
    skipDetails = false,
    dateBoundary?: Date
): Promise<GetNFTCollection> {
    const { conseilUrl, apiKey, network } = node;
    const errors: NFTError[] = []; // Store errors to display to the user.

    // 1. Build and execute the query:
    let collectionQuery = ConseilQueryBuilder.blankQuery();
    collectionQuery = ConseilQueryBuilder.addFields(collectionQuery, 'key', 'value', 'timestamp', 'operation_group_id');
    collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'big_map_id', ConseilOperator.EQ, [tokenMapId]);
    collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'key', ConseilOperator.STARTSWITH, [
        `Pair 0x${await window.conseiljs.TezosMessageUtils.writeAddress(managerAddress)}`,
    ]);
    collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'value', ConseilOperator.EQ, [0], true);
    collectionQuery = ConseilQueryBuilder.setLimit(collectionQuery, 10_000);
    if (dateBoundary && dateBoundary.getTime() > GenesisBlockTime.getTime()) {
        collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'timestamp', ConseilOperator.GT, [dateBoundary.getTime()]);
    }

    const collectionResult = await window.conseiljs.TezosConseilClient.getTezosEntityData(
        { url: conseilUrl, apiKey, network },
        network,
        'big_map_contents',
        collectionQuery
    ).catch((e) => {
        console.log(`failed to getHicEtNuncCollection at ${tokenAddress}/${tokenMapId}`, e);
        return [];
    });

    const operationGroupIds = collectionResult
        .filter((r) => {
            try {
                if (Number(r.value) === 0) {
                    return false;
                }
            } catch (err) {
                /* meh */
            }
            return true;
        })
        .map((r) => r.operation_group_id);
    const queryChunks = chunkArray(operationGroupIds, 30);

    // 2. Get prices:
    const priceQueries = queryChunks.map((c) => makeLastPriceQuery(c));

    const priceMap: any = {};
    await Promise.all(
        priceQueries.map(async (q) =>
            window.conseiljs.TezosConseilClient.getTezosEntityData({ url: conseilUrl, apiKey, network }, network, 'operations', q).then((result) =>
                result.forEach((row) => {
                    let amount = 0;
                    let action = row.parameters_entrypoints;

                    if (action === 'collect') {
                        amount = Number(row.parameters.toString().replace(/^Pair ([0-9]+) [0-9]+/, '$1'));
                    } else if (action === 'transfer') {
                        action = 'collect';
                        amount = Number(
                            row.parameters
                                .toString()
                                .replace(/[{] Pair \"[1-9A-HJ-NP-Za-km-z]{36}\" [{] Pair \"[1-9A-HJ-NP-Za-km-z]{36}\" [(]Pair [0-9]+ [0-9]+[)] [}] [}]/, '$1')
                        );
                    } else if (action === 'mint_OBJKT') {
                        action = 'mint';
                    } else {
                        action = 'collect';
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
            let action = '';

            try {
                const priceRecord = priceMap[row.operation_group_id];
                price = priceRecord.price.toNumber();
                action = priceRecord.action === 'collect' ? NFT_ACTION_TYPES.COLLECTED : NFT_ACTION_TYPES.MINTED;
            } catch {
                //
            }

            let nftObject = {
                tokenAddress,
                objectId,
                provider: NFT_PROVIDERS.HIC_ET_NUNC,
                amount: Number(row.value),
                price: Number.isNaN(price) ? 0 : price,
                receivedOn: new Date(row.timestamp),
                action,
            } as NFTObject;

            // Get the other object details, like name, description, artifactUrl, etc.
            if (!skipDetails) {
                try {
                    objectDetails = await getHENNFTObjectDetails(node.tezosUrl, objectId);

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
                } catch (e) {
                    errors.push({
                        code: NFT_ERRORS.UNSUPPORTED_PROVIDER,
                        data: [
                            {
                                key: 'provider',
                                value: 'Hic et nunc',
                            },
                        ],
                    });
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
    // errors.push({
    //     code: NFT_ERRORS.UNSUPPORTED_PROVIDER,
    //     data: [
    //         {
    //             key: 'provider',
    //             value: 'Hic et nunc',
    //         },
    //     ],
    // });
    // errors.push({
    //     code: NFT_ERRORS.UNSUPPORTED_DATA_FORMAT,
    //     data: [
    //         {
    //             key: 'field',
    //             translate_value: 'components.nftGallery.fields.artifactUrl',
    //         },
    //         {
    //             key: 'provider',
    //             value: 'Hic et nunc',
    //         },
    //     ],
    // });
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
export async function getKalamintCollection(
    tokenAddress: string,
    tokenMapId: number,
    managerAddress: string,
    node: Node,
    skipDetails = false,
    dateBoundary?: Date
): Promise<GetNFTCollection> {
    const { conseilUrl, apiKey, network } = node;
    const errors: NFTError[] = []; // Store errors to display to the user.

    // 1. Build and execute the query:
    let collectionQuery = ConseilQueryBuilder.blankQuery();
    collectionQuery = ConseilQueryBuilder.addFields(collectionQuery, 'key', 'value', 'timestamp', 'operation_group_id');
    collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'big_map_id', ConseilOperator.EQ, [tokenMapId]);
    collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'key', ConseilOperator.STARTSWITH, [
        `Pair 0x${await window.conseiljs.TezosMessageUtils.writeAddress(managerAddress)}`,
    ]);
    collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'value', ConseilOperator.EQ, [0], true);
    collectionQuery = ConseilQueryBuilder.setLimit(collectionQuery, 10_000);

    if (dateBoundary && dateBoundary.getTime() > GenesisBlockTime.getTime()) {
        collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'timestamp', ConseilOperator.GT, [dateBoundary.getTime()]);
    }

    const collectionResult = await window.conseiljs.TezosConseilClient.getTezosEntityData(
        { url: conseilUrl, apiKey, network },
        network,
        'big_map_contents',
        collectionQuery
    ).catch((e) => {
        console.log(`failed to getKalamintCollection at ${tokenAddress}/${tokenMapId}`, e);
        return [];
    });

    const operationGroupIds = collectionResult.map((r) => r.operation_group_id);
    const queryChunks = chunkArray(operationGroupIds, 30);

    // 2. Get prices:
    const priceQueries = queryChunks.map((c) => makeLastPriceQuery(c));

    const priceMap: any = {};
    await Promise.all(
        priceQueries.map(async (q) =>
            window.conseiljs.TezosConseilClient.getTezosEntityData({ url: conseilUrl, apiKey, network }, network, 'operations', q).then((result) =>
                result.forEach((row) => {
                    let amount = 0;
                    let action = row.parameters_entrypoints;

                    if (action === 'collect') {
                        amount = Number(row.parameters.toString().replace(/^Pair ([0-9]+) [0-9]+/, '$1'));
                    } else if (action === 'transfer') {
                        action = 'collect';
                        amount = Number(
                            row.parameters
                                .toString()
                                .replace(/[{] Pair \"[1-9A-HJ-NP-Za-km-z]{36}\" [{] Pair \"[1-9A-HJ-NP-Za-km-z]{36}\" [(]Pair [0-9]+ [0-9]+[)] [}] [}]/, '$1')
                        );
                    } else if (action === 'mint') {
                        action = 'mint';
                    } else {
                        action = 'collect';
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
            let action = '';

            try {
                const priceRecord = priceMap[row.operation_group_id];
                price = priceRecord.price.toNumber();
                action = priceRecord.action === 'collect' ? NFT_ACTION_TYPES.COLLECTED : NFT_ACTION_TYPES.MINTED;
            } catch {
                //
            }

            let nftObject = {
                tokenAddress,
                objectId,
                provider: NFT_PROVIDERS.KALAMINT,
                amount: Number(row.value),
                price: Number.isNaN(price) ? 0 : price,
                receivedOn: new Date(row.timestamp),
                action,
            } as NFTObject;

            // Get the other object details, like name, description, artifactUrl, etc.
            if (!skipDetails) {
                try {
                    objectDetails = await getKalamintNFTObjectDetails(node.tezosUrl, objectId);

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
                } catch (e) {
                    console.log('could not process kalamint metadata', e);
                    errors.push({
                        code: NFT_ERRORS.UNSUPPORTED_DATA_FORMAT,
                        data: [
                            {
                                key: 'provider',
                                value: 'Kalamint',
                            },
                        ],
                    });
                }
            }

            return nftObject;
        })
    );

    // 5. Return the response:
    return { collection, errors };
}

export async function getObjktNFTDetails(tezosUrl: string, objectId: number | string, metadataMap: number, urlPath = '$.args[1][0].args[1].bytes') {
    const packedNftId = await window.conseiljs.TezosMessageUtils.encodeBigMapKey(objectId, 'int', 'hex');
    const nftInfo = await window.conseiljs.TezosNodeReader.getValueForBigMapKey(tezosUrl, metadataMap, packedNftId); // TODO: store in token definition

    const ipfsUrlBytes = JSONPath({ path: urlPath, json: nftInfo })[0];
    const ipfsUrlString = window.electron.buffer.fromString(ipfsUrlBytes, 'hex');
    const urlStart = ipfsUrlString.indexOf('ipfs://');
    const ipfsHash = ipfsUrlString.slice(urlStart + 7);
    const nftDetailJson = await window.electron.fetch(`https://cloudflare-ipfs.com/ipfs/${ipfsHash}`, { cache: 'no-store' }).catch((e) => {
        console.log(`error fetching nft metadata ${objectId}, ${ipfsHash}`);
        return {
            json: () => {
                /* */
            },
        };
    });
    // const nftDetailJson = await nftDetails.json();

    const nftName = nftDetailJson.name;
    const nftDescription = nftDetailJson.description;

    let nftCreators = !nftDetailJson.creators
        ? ''
        : nftDetailJson.creators
              .map((c: string) => c.trim())
              .map((c: string) => (c.startsWith('tz') ? `${c.slice(0, 6)}...${c.slice(c.length - 6, c.length)}` : c))
              .join(', '); // TODO: use names where possible

    if (nftCreators.length === 0 && nftDetailJson.minter) {
        // byteblock, oneof
        nftCreators = `${nftDetailJson.minter.slice(0, 6)}...${nftDetailJson.minter.slice(nftDetailJson.minter.length - 6, nftDetailJson.minter.length)}`;
    }

    const nftArtifactType = nftDetailJson.formats ? nftDetailJson.formats[0].mimeType.toString() : 'image/png';

    let nftArtifact = nftDetailJson.artifactUri;
    let nftThumbnailUri = nftDetailJson.thumbnailUri ? makeUrl(nftDetailJson.thumbnailUri) : makeUrl(nftArtifact);

    // Check the proxy:
    let nftArtifactModerationMessage;
    const artifactProxy = await getNFTArtifactProxy(nftArtifact, nftArtifactType);
    if (artifactProxy && artifactProxy.content.length > 1000) {
        nftArtifact = artifactProxy.content;
        nftArtifactModerationMessage = artifactProxy.moderationMessage;
    } else if (nftDetailJson.formats !== undefined && nftDetailJson.formats.length > 0 && nftDetailJson.formats[0].uri) {
        if (/video|mp4|ogg|webm/.test(nftArtifactType.toLowerCase())) {
            nftArtifact = makeUrl(nftDetailJson.formats[0].uri.toString());
        } else if (/image|audio/.test(nftArtifactType.toLowerCase())) {
            nftArtifact = makeUrl(nftDetailJson.formats[0].uri.toString());
        }
    } else {
        if (nftThumbnailUri === nftArtifact && !/image/.test(nftArtifactType.toLowerCase())) {
            nftThumbnailUri = '';
        }

        nftArtifact = makeUrl(nftDetailJson.artifactUri.toString());
        console.log(`could not fetch NFT content from proxy, using ${nftArtifact}`);
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

export async function get8bidouDetails(tezosUrl: string, objectId: number | string, metadataMap: number) {
    const packedNftId = await window.conseiljs.TezosMessageUtils.encodeBigMapKey(objectId, 'int', 'hex');
    const nftInfo = await window.conseiljs.TezosNodeReader.getValueForBigMapKey(tezosUrl, metadataMap, packedNftId);

    const creatorBytes = JSONPath({ path: '$.args[2].bytes', json: nftInfo })[0]; // $.args[1].string
    const descriptionBytes = JSONPath({ path: '$.args[4].bytes', json: nftInfo })[0];
    const nameBytes = JSONPath({ path: '$.args[3].bytes', json: nftInfo })[0];
    const imageDataBytes = JSONPath({ path: '$.args[5].string', json: nftInfo })[0];

    const nftCreators = window.electron.buffer.fromString(creatorBytes, 'hex');
    const nftDescription = window.electron.buffer.fromString(descriptionBytes, 'hex');
    const nftName = window.electron.buffer.fromString(nameBytes, 'hex');

    // const image = new png.PNG({ width: 8, height: 8, bitDepth: 8, colorType: 2, inputColorType: 2, inputHasAlpha: false });
    // image.data = window.electron.buffer.from(imageDataBytes, 'hex');
    // const buffer = png.PNG.sync.write(image, { width: 8, height: 8, bitDepth: 8, colorType: 2, inputColorType: 2, inputHasAlpha: false });
    // const artifactUrl = `data:image/png;base64,${buffer.toString('base64')}`;
    const artifactUrl = window.electron.pngJS.get(imageDataBytes);

    return {
        name: nftName,
        description: nftDescription,
        creators: nftCreators,
        artifactUrl,
        artifactType: 'image/png',
        artifactModerationMessage: undefined,
        thumbnailUri: artifactUrl,
    };
}

export async function getDogamiDetails(tezosUrl: string, objectId: number | string, metadataMap: number) {
    const packedNftId = await window.conseiljs.TezosMessageUtils.encodeBigMapKey(objectId, 'int', 'hex');
    const nftInfo = await window.conseiljs.TezosNodeReader.getValueForBigMapKey(tezosUrl, metadataMap, packedNftId);

    const artifactUrlBytes = JSONPath({ path: '$.args[1][0].args[1].bytes', json: nftInfo })[0];
    const creatorBytes = JSONPath({ path: '$.args[1][2].args[1].bytes', json: nftInfo })[0];
    const descriptionBytes = JSONPath({ path: '$.args[1][4].args[1].bytes', json: nftInfo })[0];
    const formatBytes = JSONPath({ path: '$.args[1][6].args[1].bytes', json: nftInfo })[0];
    const nameBytes = JSONPath({ path: '$.args[1][8].args[1].bytes', json: nftInfo })[0];
    const thumbnailUriBytes = JSONPath({ path: '$.args[1][11].args[1].bytes', json: nftInfo })[0];

    const nftArtifactUri = makeUrl(window.electron.buffer.fromString(artifactUrlBytes, 'hex'), 'video/mp4');
    const nftCreators = JSON.parse(window.electron.buffer.fromString(creatorBytes, 'hex'))[0];
    const nftDescription = window.electron.buffer.fromString(descriptionBytes, 'hex');
    const nftArtifactType = JSON.parse(window.electron.buffer.fromString(formatBytes, 'hex'))[0].mimeType;
    const nftName = window.electron.buffer.fromString(nameBytes, 'hex');
    const nftThumbnailUri = makeUrl(window.electron.buffer.fromString(thumbnailUriBytes, 'hex'), 'image/png');

    return {
        name: nftName,
        description: nftDescription,
        creators: nftCreators,
        artifactUrl: nftArtifactUri,
        artifactType: nftArtifactType,
        artifactModerationMessage: undefined,
        thumbnailUri: nftThumbnailUri,
    };
}

function makeUrl(source: string, type = '') {
    if (source.startsWith('http')) {
        return source;
    }

    if (type === '' && source.startsWith('ipfs')) {
        return `https://ipfs.io/ipfs/${source.slice(7)}`;
    }

    if (/video|mp4|ogg|webm/.test(type.toLowerCase())) {
        return `https://ipfs.io/ipfs/${source.slice(7)}`;
    }
    if (/image|audio/.test(type.toLowerCase())) {
        return `https://cloudflare-ipfs.com/ipfs/${source.slice(7)}`;
    }
}

export async function getPotusCollection(
    tokenAddress: string,
    tokenMapId: number,
    managerAddress: string,
    node: Node,
    skipDetails = false,
    dateBoundary?: Date
): Promise<GetNFTCollection> {
    const { conseilUrl, apiKey, network } = node;
    const errors: NFTError[] = []; // Store errors to display to the user.

    // 1. Build and execute the query:
    let collectionQuery = ConseilQueryBuilder.blankQuery();
    collectionQuery = ConseilQueryBuilder.addFields(collectionQuery, 'key', 'value', 'timestamp', 'operation_group_id');
    collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'big_map_id', ConseilOperator.EQ, [`${tokenMapId}`]);
    collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'key', ConseilOperator.STARTSWITH, [
        `Pair 0x${await window.conseiljs.TezosMessageUtils.writeAddress(managerAddress)}`,
    ]);
    collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'value', ConseilOperator.EQ, [0], true);
    collectionQuery = ConseilQueryBuilder.setLimit(collectionQuery, 10_000);

    if (dateBoundary && dateBoundary.getTime() > GenesisBlockTime.getTime()) {
        collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'timestamp', ConseilOperator.GT, [dateBoundary.getTime()]);
    }

    const collectionResult = await window.conseiljs.TezosConseilClient.getTezosEntityData(
        { url: conseilUrl, apiKey, network },
        network,
        'big_map_contents',
        collectionQuery
    ).catch((e) => {
        console.log(`failed to getPotusCollection at ${tokenAddress}/${tokenMapId}`, e);
        return [];
    });

    const priceMap: any = {};

    const collection = await Promise.all(
        collectionResult.map(async (row) => {
            let price = 0;
            const objectId = new BigNumber(row.key.toString().replace(/.* ([0-9]{1,}$)/, '$1')).toNumber();
            let objectDetails;
            let action = '';

            try {
                const priceRecord = priceMap[row.operation_group_id];
                price = priceRecord.price.toNumber();
                action = priceRecord.action === 'collect' ? NFT_ACTION_TYPES.COLLECTED : NFT_ACTION_TYPES.MINTED;
            } catch {
                //
            }

            let nftObject = {
                tokenAddress,
                objectId,
                provider: NFT_PROVIDERS.PIXEL_POTUS,
                amount: 1,
                price: Number.isNaN(price) ? 0 : price,
                receivedOn: new Date(row.timestamp),
                action,
            } as NFTObject;

            // Get the other object details, like name, description, artifactUrl, etc.
            if (!skipDetails) {
                try {
                    objectDetails = await getPotusNFTObjectDetails(node.tezosUrl, objectId);

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
                } catch (e) {
                    console.log('error reading PixelPotus data', e);
                    errors.push({
                        code: NFT_ERRORS.UNSUPPORTED_DATA_FORMAT,
                        data: [
                            {
                                key: 'provider',
                                value: NFT_PROVIDERS.PIXEL_POTUS,
                            },
                        ],
                    });
                }
            }

            return nftObject;
        })
    );

    return { collection, errors };
}

export async function getPotusNFTObjectDetails(tezosUrl: string, objectId: number) {
    const packedNftId = await window.conseiljs.TezosMessageUtils.encodeBigMapKey(objectId, 'int', 'hex');
    const nftInfo = await window.conseiljs.TezosNodeReader.getValueForBigMapKey(tezosUrl, 5631, packedNftId); // TODO: store in token definition
    const ipfsUrlBytes = JSONPath({ path: '$.args[1][0].args[1].bytes', json: nftInfo })[0];
    const ipfsHash = window.electron.buffer.fromString(ipfsUrlBytes, 'hex').slice(7);

    const nftDetailJson = await window.electron.fetch(`https://cloudflare-ipfs.com/ipfs/${ipfsHash}`, { cache: 'no-store' });
    // const nftDetailJson = await nftDetails.json();

    const nftName = nftDetailJson.name;
    const nftDescription = nftDetailJson.description;
    const nftCreators = nftDetailJson.creators[0];
    const nftArtifactType = 'image/png'; // HACK: no mime type in kalamint metadata

    let nftArtifact = nftDetailJson.artifactUri;
    const nftThumbnailUri = `https://ipfs.io/ipfs/${nftDetailJson.thumbnailUri.slice(7)}`;

    // Check the proxy:
    let nftArtifactModerationMessage;
    const artifactProxy = await getNFTArtifactProxy(nftArtifact, nftArtifactType);
    if (artifactProxy && artifactProxy.content.length > 1000) {
        nftArtifact = artifactProxy.content;
        nftArtifactModerationMessage = artifactProxy.moderationMessage;
    } else {
        nftArtifact = `https://cloudflare-ipfs.com/ipfs/${nftDetailJson.artifactUri.slice(7)}`;
        console.log(`could not fetch NFT content from proxy, using ${nftArtifact}`);
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

export async function getCollection(
    tokenAddress: string,
    tokenMapId: number,
    queryArg: 'key' | 'value',
    metadataMapId: number,
    provider: string,
    managerAddress: string,
    node: Node,
    skipDetails = false,
    urlPath?: string,
    dateBoundary?: Date
): Promise<GetNFTCollection> {
    const { conseilUrl, apiKey, network } = node;
    const errors: NFTError[] = []; // Store errors to display to the user.

    let collectionQuery = ConseilQueryBuilder.blankQuery();
    collectionQuery = ConseilQueryBuilder.addFields(collectionQuery, 'key', 'value', 'timestamp', 'operation_group_id');
    collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'big_map_id', ConseilOperator.EQ, [tokenMapId]);
    if (queryArg === 'key') {
        collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'key', ConseilOperator.LIKE, [
            `0x${await window.conseiljs.TezosMessageUtils.writeAddress(managerAddress)}`,
        ]);
        collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'value', ConseilOperator.EQ, [0], true);
    } else if (queryArg === 'value') {
        collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'value', ConseilOperator.EQ, [
            `0x${await window.conseiljs.TezosMessageUtils.writeAddress(managerAddress)}`,
        ]);
    } else {
        throw new Error('invalid ledger query');
    }

    if (dateBoundary && dateBoundary.getTime() > GenesisBlockTime.getTime()) {
        collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'timestamp', ConseilOperator.GT, [dateBoundary.getTime()]);
    }

    collectionQuery = ConseilQueryBuilder.setLimit(collectionQuery, 10_000);

    const collectionResult = await window.conseiljs.TezosConseilClient.getTezosEntityData(
        { url: conseilUrl, apiKey, network },
        network,
        'big_map_contents',
        collectionQuery
    ).catch((e) => {
        console.log(`failed to getCollection at ${tokenAddress}/${tokenMapId}`, e);
        return [];
    });

    const operationGroupIds = collectionResult.map((r) => r.operation_group_id);
    const queryChunks = chunkArray(operationGroupIds, 30);

    const priceQueries = queryChunks.map((c) => makeLastPriceQuery(c));

    const priceMap: any = {};
    await Promise.all(
        priceQueries.map(async (q) =>
            window.conseiljs.TezosConseilClient.getTezosEntityData({ url: conseilUrl, apiKey, network }, network, 'operations', q).then((result) =>
                result.forEach((row) => {
                    let amount = 0;
                    let action = row.parameters_entrypoints;

                    if (action === 'collect' || action === 'fulfill_ask') {
                        // hen, objkt
                        action = 'collect';
                        amount = Number(row.parameters.toString().replace(/^Pair ([0-9]+) [0-9]+/, '$1'));
                    } else if (action === 'transfer') {
                        action = 'collect';
                        amount = Number(
                            row.parameters
                                .toString()
                                .replace(/[{] Pair \"[1-9A-HJ-NP-Za-km-z]{36}\" [{] Pair \"[1-9A-HJ-NP-Za-km-z]{36}\" [(]Pair [0-9]+ [0-9]+[)] [}] [}]/, '$1')
                        );
                    } else if (action === 'mint' && tokenAddress === 'KT1KEa8z6vWXDJrVqtMrAeDVzsvxat3kHaCE') {
                        // fxhash
                        action = 'collect';
                        amount = row.amount;
                    } else if (action === 'match_orders' && tokenAddress === 'KT18pVpRXKPY2c4U2yFEGSH3ZnhB2kL8kwXS') {
                        // rarible
                        action = 'collect';
                        amount = row.amount;
                    } else if (action === 'mint_OBJKT') {
                        action = 'mint';
                    } else {
                        action = 'collect';
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

    const collection = await Promise.all(
        collectionResult.map(async (row) => {
            let price = 0;
            let objectId = '0';
            const matchHead = row.key.toString().replace(/^Pair ([0-9]{1,}) 0x[0-9a-f]{44}/, '$1');
            const matchTail = row.key.toString().replace(/Pair 0x[0-9a-f]{44} ([0-9]{1,})$/, '$1');
            if (/^[0-9]{1,}$/.test(matchHead)) {
                objectId = matchHead;
            } else if (/^[0-9]{1,}$/g.test(matchTail)) {
                objectId = matchTail;
            } else {
                objectId = row.key;
            }

            let objectDetails;
            let action = '';

            try {
                const priceRecord = priceMap[row.operation_group_id];
                price = priceRecord.price.toNumber();
                action = priceRecord.action === 'collect' ? NFT_ACTION_TYPES.COLLECTED : NFT_ACTION_TYPES.MINTED;
            } catch {
                //
            }

            let nftObject = {
                tokenAddress,
                objectId,
                provider,
                amount: 1,
                price: Number.isNaN(price) ? 0 : price,
                receivedOn: new Date(row.timestamp),
                action,
            } as NFTObject;

            if (!skipDetails) {
                try {
                    if (metadataMapId === 115420) {
                        // HACK: dogami
                        objectDetails = await getDogamiDetails(node.tezosUrl, objectId, metadataMapId);
                    } else if (metadataMapId === 113218) {
                        // HACK 8bidou
                        objectDetails = await get8bidouDetails(node.tezosUrl, objectId, metadataMapId);
                    } else {
                        objectDetails = await getObjktNFTDetails(node.tezosUrl, objectId, metadataMapId, urlPath);
                    }

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
                } catch (e) {
                    console.log(`error reading ${tokenAddress} metadata from ${metadataMapId} for ${objectId}`);
                    console.log(e);
                    errors.push({
                        code: NFT_ERRORS.UNSUPPORTED_DATA_FORMAT,
                        data: [{ key: 'provider', value: provider }],
                    });
                }
            }

            return nftObject;
        })
    );

    return { collection, errors };
}

export async function getHashThreeCollection(
    tokenAddress: string,
    tokenMapId: number,
    managerAddress: string,
    node: Node,
    skipDetails = false,
    dateBoundary?: Date
): Promise<GetNFTCollection> {
    const { conseilUrl, apiKey, network } = node;
    const errors: NFTError[] = []; // Store errors to display to the user.

    // 1. Build and execute the query:
    let collectionQuery = ConseilQueryBuilder.blankQuery();
    collectionQuery = ConseilQueryBuilder.addFields(collectionQuery, 'key', 'value', 'timestamp', 'operation_group_id');
    collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'big_map_id', ConseilOperator.EQ, [tokenMapId]);
    collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'key', ConseilOperator.STARTSWITH, [
        `Pair 0x${await window.conseiljs.TezosMessageUtils.writeAddress(managerAddress)}`,
    ]);
    collectionQuery = ConseilQueryBuilder.setLimit(collectionQuery, 10_000);

    if (dateBoundary && dateBoundary.getTime() > GenesisBlockTime.getTime()) {
        collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'timestamp', ConseilOperator.GT, [dateBoundary.getTime()]);
    }

    const collectionResult = await window.conseiljs.TezosConseilClient.getTezosEntityData(
        { url: conseilUrl, apiKey, network },
        network,
        'big_map_contents',
        collectionQuery
    ).catch((e) => {
        console.log(`failed to getHashThreeCollection at ${tokenAddress}/${tokenMapId}`, e);
        return [];
    });

    const operationGroupIds = collectionResult.map((r) => r.operation_group_id);
    const queryChunks = chunkArray(operationGroupIds, 30);

    const priceQueries = queryChunks.map((c) => makeLastPriceQuery(c));

    const priceMap: any = {};
    await Promise.all(
        priceQueries.map(async (q) =>
            window.conseiljs.TezosConseilClient.getTezosEntityData({ url: conseilUrl, apiKey, network }, network, 'operations', q).then((result) =>
                result.forEach((row) => {
                    let amount = 0;
                    let action = row.parameters_entrypoints;

                    if (action === 'collect' || action === 'fulfill_ask') {
                        // hen, objkt
                        action = 'collect';
                        amount = Number(row.parameters.toString().replace(/^Pair ([0-9]+) [0-9]+/, '$1'));
                    } else if (action === 'transfer') {
                        // fa2
                        action = 'collect';
                        amount = Number(
                            row.parameters
                                .toString()
                                .replace(/[{] Pair \"[1-9A-HJ-NP-Za-km-z]{36}\" [{] Pair \"[1-9A-HJ-NP-Za-km-z]{36}\" [(]Pair [0-9]+ [0-9]+[)] [}] [}]/, '$1')
                        );
                    } else if (action === 'mint_OBJKT') {
                        // hen
                        action = 'mint';
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
            const objectId = row.key.toString().replace(/.* ([0-9]{1,}$)/, '$1');
            let objectDetails;
            let action = '';

            try {
                const priceRecord = priceMap[row.operation_group_id];
                price = priceRecord.price.toNumber();
                action = priceRecord.action === 'collect' ? NFT_ACTION_TYPES.COLLECTED : NFT_ACTION_TYPES.MINTED;
            } catch {
                //
            }

            let nftObject = {
                tokenAddress,
                objectId,
                provider: NFT_PROVIDERS.H3P,
                amount: 1,
                price: Number.isNaN(price) ? 0 : price,
                receivedOn: new Date(row.timestamp),
                action,
            } as NFTObject;

            // Get the other object details, like name, description, artifactUrl, etc.
            if (!skipDetails) {
                try {
                    objectDetails = await getHashThreeNFTDetails(node.tezosUrl, objectId, 19750);
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
                } catch (e) {
                    console.log('error reading hashthree data', objectId, e);
                    errors.push({
                        code: NFT_ERRORS.UNSUPPORTED_DATA_FORMAT,
                        data: [
                            {
                                key: 'provider',
                                value: 'H3P',
                            },
                        ],
                    });
                }
            }

            return nftObject;
        })
    );

    return { collection, errors };
}

export async function getHashThreeNFTDetails(tezosUrl: string, objectId: number | string, metadataMap: number) {
    const packedNftId = await window.conseiljs.TezosMessageUtils.encodeBigMapKey(`token_${objectId}_metadata`, 'string', 'hex');
    const nftInfo = await window.conseiljs.TezosNodeReader.getValueForBigMapKey(tezosUrl, metadataMap, packedNftId); // TODO: store in token definition
    const metadataBytes = JSONPath({ path: '$.bytes', json: nftInfo })[0];
    const metadataString = window.electron.buffer.fromString(metadataBytes, 'hex');
    const nftDetailJson = JSON.parse(metadataString);

    const nftName = nftDetailJson.name;
    const nftDescription = nftDetailJson.description;
    const nftCreators = nftDetailJson.creators
        .map((c) => c.trim())
        .map((c) => (['tz1', 'tz2', 'tz3', 'KT1'].includes(c) && c.length === 36 ? `${c.slice(0, 6)}...${c.slice(c.length - 6, c.length)}` : c))
        .join(', '); // TODO: use names where possible
    const nftArtifactType = nftDetailJson.formats[0].mimeType.toString();

    let nftArtifact = nftDetailJson.artifactUri;
    const nftThumbnailUri = `https://ipfs.io/ipfs/${nftDetailJson.thumbnailUri.slice(7)}`;

    // Check the proxy:
    let nftArtifactModerationMessage;
    const artifactProxy = await getNFTArtifactProxy(nftArtifact, nftArtifactType);
    if (artifactProxy && artifactProxy.content.length > 1000) {
        nftArtifact = artifactProxy.content;
        nftArtifactModerationMessage = artifactProxy.moderationMessage;
    } else if (/video|mp4|ogg|webm/.test(nftArtifactType.toLowerCase())) {
        nftArtifact = `https://ipfs.io/ipfs/${nftDetailJson.formats[0].uri.toString().slice(7)}`;
    } else {
        nftArtifact = `https://cloudflare-ipfs.com/ipfs/${nftDetailJson.formats[0].uri.toString().slice(7)}`;
        console.log(`could not fetch NFT content from proxy, using ${nftArtifact}`);
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
    tokenAddress: string,
    isLedger: boolean,
    password: string,
    keystore: KeyStore,
    fee: number,
    source: string,
    transfers: {
        address: string;
        tokenid: number | string;
        amount: number;
    }[],
    gas?: number,
    freight?: number
): Promise<string> {
    try {
        const transferPairs = [
            {
                source,
                txs: transfers.map((t) => {
                    return { destination: t.address, token_id: t.tokenid, amount: t.amount };
                }),
            },
        ];

        return await window.conseiljs.MultiAssetTokenHelper.transfer(server, tokenAddress, isLedger, password, keystore, fee, transferPairs, gas, freight);
    } catch (err) {
        throw new TransferNFTError('components.messageBar.messages.nft_send_transaction_failed', transfers);
    }
}

/**
 * Get the NFT collection size.
 * If you need a collection size for a specific token, pass the one-element array, ie: [token].
 *
 * @param {ArtToken} tokens - the list of tokens
 * @param {string} managerAddress - manager address
 * @param {Node} node - selected node
 *
 * @return {Promise<number>}
 */
export async function getCollectionSize(tokens: ArtToken[], managerAddress: string, node: Node): Promise<number> {
    const { collections } = await getNFTCollections(tokens, managerAddress, node, true);
    const tokenCount = collections.collected.reduce((a, c) => a + c.amount, 0) + collections.minted.reduce((a, c) => a + c.amount, 0);

    return tokenCount;
}

export async function parseObjktContract(tezosNode: string, contractAddress: string) {
    const tokenDefinition: ArtToken = {
        network: 'mainnet',
        symbol: '',
        balance: 0,
        transactions: [],
        activeTab: 'COLLECTION',
        kind: TokenKind.objkt,
        scale: 0,
        precision: 0,
        round: 0,
        holderLocation: 'key',
        provider: 'OBJKT_GENERIC',
        hideOnLanding: true,
        marketAddress: '',

        address: contractAddress,
        displayName: '',
        mapid: -1,
        nftMetadataMap: -1,
        helpLink: '',
    };

    const storageResult = await window.conseiljs.TezosNodeReader.getContractStorage(tezosNode, contractAddress);

    const ledgerMapId = Number(JSONPath({ path: '$.args[0].args[1].int', json: storageResult })[0]);
    const metadataMapId = Number(JSONPath({ path: '$.args[0].args[2].int', json: storageResult })[0]);
    const contractMetadataMapId = Number(JSONPath({ path: '$.args[0].args[2].int', json: storageResult })[0]);
    const tokenMetadataMapId = Number(JSONPath({ path: '$.args[2].int', json: storageResult })[0]);

    let contractMetadataJson: any = {};
    try {
        const packedKey = await window.conseiljs.TezosMessageUtils.encodeBigMapKey('meta', 'string', 'hex');
        const contractMetadataResult = await window.conseiljs.TezosNodeReader.getValueForBigMapKey(tezosNode, contractMetadataMapId, packedKey);
        contractMetadataJson = JSON.parse(window.electron.buffer.fromString(contractMetadataResult.bytes, 'hex'));

        if (contractMetadataJson.homepage) {
            tokenDefinition.displayHelpLink = contractMetadataJson.homepage;
        }

        if (contractMetadataJson.name) {
            tokenDefinition.displayName = contractMetadataJson.name;
        }
    } catch {
        //
    }

    try {
        if (!tokenDefinition.displayName) {
            const packedNftId = await window.conseiljs.TezosMessageUtils.encodeBigMapKey('', 'string', 'hex');
            const nftInfo = await window.conseiljs.TezosNodeReader.getValueForBigMapKey(tezosNode, metadataMapId, packedNftId);
            const ipfsUrlBytes = JSONPath({ path: '$.bytes', json: nftInfo })[0];
            const ipfsHash = window.electron.buffer.fromString(ipfsUrlBytes, 'hex').slice(7);

            const nftDetailJson = await window.electron.fetch(`https://cloudflare-ipfs.com/ipfs/${ipfsHash}`, { cache: 'no-store' });
            // const nftDetailJson = await nftDetails.json();

            if (nftDetailJson.homepage) {
                tokenDefinition.displayHelpLink = nftDetailJson.homepage;
            }

            if (nftDetailJson.name) {
                tokenDefinition.displayName = nftDetailJson.name;
            }
        }
    } catch {
        //
    }

    tokenDefinition.mapid = ledgerMapId;
    tokenDefinition.nftMetadataMap = tokenMetadataMapId;

    return tokenDefinition;
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

    sorted.forEach((token) => {
        if (token.action === NFT_ACTION_TYPES.MINTED) {
            grouped.minted.push(token);
        } else {
            grouped.collected.push(token);
        }
    });

    return grouped;
}
