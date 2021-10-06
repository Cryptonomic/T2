import { Collections } from '@mui/icons-material';
import { createSelector } from 'reselect';
import { RootState } from '../../types/store';
import { GetNFTCollectionsDataSelector } from './types';

export const getNFT = (state: RootState) => state.nft;

/**
 * Get NFT collections, errors, loading and syncing status.
 *
 * @return {GetNFTCollectionsDataSelector}
 */
export const getNFTCollectionsDataSelector = createSelector(
    getNFT,
    (nft): GetNFTCollectionsDataSelector => {
        return {
            collections: nft.collections,
            errors: nft.getCollectionsErrors,
            loading: nft.collectionsAreLoading,
            lastSyncAt: nft.lastSyncAt,
            isNFTSyncing: nft.isNFTSyncing,
        };
    }
);
