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

import { NFT_ACTION_TYPES, NFT_ERRORS, NFT_PROVIDERS } from './constants';
import { TransferNFTError } from './exceptions';
import { NFTObject, NFTCollections, NFTError, GetNFTCollections } from './types';

import { Node, Token, TokenKind } from '../../types/general';

/* ERRORS:
 * -----------------------
 * Errors are handled on two ways.
 *
 * The first of all, errors "not-harming" the response format or success are collected in the "errors" variable (NFTError).
 * The each error contains the "code" field (list of available codes is defined in ../constants.ts#NFT_ERRORS).
 * Then, the "code" is translated and rendered in the application. The translation comes from: components.nftGallery.errors.${code}.
 * If the additional data has to be passed to the translation, you can use optional "data" field:
 * {
 *   code: NFT_ERRORS.UNSUPPORTED_DATA_FORMAT,  // -> t('components.nftGallery.errors.unsupported_data_format')
 *   data: [
 *     {
 *       key: 'provider'
 *       value: 'Hic et nunc' // uses the given string as it is when it is set with the "Value" field.
 *     },
 *     {
 *       key: 'field',
 *       translate_value: 'components.nftGallery.fields.artifactUrl' // uses the translation from a given path.
 *     }
 *   ]
 * }
 *
 * Translations:
 * components.nftGallery.errors.unsupported_data_format: The {{field}} from {{provider}} is invalid."
 * components.nftGallery.fields.artifactUrl: "image URL"
 *
 * Result:
 * "The image URL from Hic et nunc is invalid".
 *
 *
 * The second supported option to handle the errors is just to throw any exception. Then the thunk's try-catch
 * block produces the generic SOMETHING_WENT_WRONG error.
 */

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
 * Get the NFT token details.
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
    const nftArtifact = `https://cloudflare-ipfs.com/ipfs/${nftDetailJson.formats[0].uri.toString().slice(7)}`;
    const nftArtifactType = nftDetailJson.formats[0].mimeType.toString();

    return { name: nftName, description: nftDescription, creators: nftCreators, artifactUrl: nftArtifact, artifactType: nftArtifactType };
}

/**
 * Get the NFT collections grouped by type (ie. collected, minted).
 * Each token contains all details.
 *
 * @param {number} tokenMapId
 * @param {string} managerAddress
 * @param {Node} node
 *
 * @return {Promise<GetNFTCollections>} the list of NFT tokens grouped by type and the list of errors.
 */
export async function getCollections(tokenMapId: number, managerAddress: string, node: Node): Promise<GetNFTCollections> {
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
            let objectId;
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

            // Get the other object details, like name, description, artifactUrl, etc.
            try {
                objectId = new BigNumber(row.key.toString().replace(/.* ([0-9]{1,}$)/, '$1')).toNumber();
                objectDetails = await getNFTObjectDetails(node.tezosUrl, objectId);
            } catch {
                //
            }

            return {
                objectId,
                provider: NFT_PROVIDERS.HIC_ET_NUNC,
                name: objectDetails.name,
                description: objectDetails.description,
                amount: Number(row.value),
                price: isNaN(price) ? 0 : price,
                receivedOn,
                action,
                artifactUrl: objectDetails.artifactUrl,
                artifactType: objectDetails.artifactType,
                creators: objectDetails.creators,
            } as NFTObject;
        })
    );

    // 4. Sort and group tokens by its type ('Minted', 'Collected', etc.):
    const sorted = collection.sort((a, b) => b.receivedOn.getTime() - a.receivedOn.getTime());
    const grouped: NFTCollections = {
        collected: [] as NFTObject[],
        minted: [] as NFTObject[],
    };

    sorted.map((token) => {
        if (token.action === NFT_ACTION_TYPES.MINTED) {
            grouped.minted.push(token);
        } else {
            grouped.collected.push(token);
        }
    });

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
    // errors.push(
    //     {
    //         code: NFT_ERRORS.UNSUPPORTED_PROVIDER,
    //         data: [
    //             {
    //                 key: 'provider',
    //                 value: 'Hic et nunc 22'
    //             }
    //         ]
    //     }
    // );
    // errors.push(
    //     {
    //         code: NFT_ERRORS.UNSUPPORTED_DATA_FORMAT,
    //         data: [
    //             {
    //                 key: 'field',
    //                 translate_value: 'components.nftGallery.fields.artifactUrl'
    //             },
    //             {
    //                 key: 'provider',
    //                 value: 'Hic et nunc'
    //             }
    //         ]
    //     }
    // );
    /* END: Fake errors */

    // 5. Return the response:
    return { collections: grouped, errors };
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
