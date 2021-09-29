import { useState, useEffect } from 'react';
import { useStore } from 'react-redux';

import { NFT_ERRORS } from './constants';
import * as NFTUtil from './util';
import { NFTCollections, NFTObject, NFTError, GetNFTCollectionResponse } from './types';

import { RootState } from '../../types/store';

import { getMainNode } from '../../utils/settings';

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
