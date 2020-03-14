import { useState, useEffect } from 'react';
import { useStore } from 'react-redux';
import { TezosConseilClient, TezosNodeReader, OperationKindType } from 'conseiljs';
import { changeAccountAction, addNewVersionAction } from './actions';
import { syncAccountOrIdentityThunk } from '../wallet/thunks';
import { getMainNode } from '../../utils/settings';
import { getVersionFromApi } from '../../utils/general';
import { AVERAGEFEES, OPERATIONFEE, REVEALOPERATIONFEE } from '../../constants/FeeValue';
import { LocalVersionIndex } from '../../config.json';

import { AverageFees, AddressType } from '../../types/general';
import { RootState } from '../../types/store';

interface FetchFees {
  newFees: AverageFees;
  isFeeLoaded: boolean;
  miniFee: number;
  isRevealed: boolean;
}

const initialFeesState: FetchFees = {
  newFees: AVERAGEFEES,
  isFeeLoaded: false,
  miniFee: OPERATIONFEE,
  isRevealed: false
};

export const useFetchFees = (
  operationKind: OperationKindType,
  isReveal: boolean = false,
  isManager: boolean = false
): FetchFees => {
  const [state, setState] = useState<FetchFees>(initialFeesState);
  const store = useStore<RootState>();
  const { newFees, isFeeLoaded, miniFee, isRevealed } = state;
  useEffect(() => {
    const fetchFeesData = async () => {
      try {
        const { selectedNode, nodesList } = store.getState().settings;
        const { conseilUrl, apiKey, network, tezosUrl } = getMainNode(nodesList, selectedNode);
        const serverFees = await TezosConseilClient.getFeeStatistics(
          { url: conseilUrl, apiKey, network },
          network,
          operationKind
        ).catch(() => [AVERAGEFEES]);
        const fees = {
          low: serverFees[0].low,
          medium: serverFees[0].medium,
          high: serverFees[0].high
        };
        let isNewRevealed = false;
        let miniLowFee = OPERATIONFEE;
        if (isReveal) {
          const { selectedAccountHash, selectedParentHash } = store.getState().app;
          const pkh = isManager ? selectedParentHash : selectedAccountHash;
          isNewRevealed = await TezosNodeReader.isManagerKeyRevealedForAccount(tezosUrl, pkh).catch(
            () => false
          );
        }

        if (!isNewRevealed) {
          fees.low += REVEALOPERATIONFEE;
          fees.medium += REVEALOPERATIONFEE;
          fees.high += REVEALOPERATIONFEE;
          miniLowFee += REVEALOPERATIONFEE;
        }
        if (newFees.low < miniLowFee) {
          fees.low = miniLowFee;
        }

        setState({
          newFees: fees,
          isRevealed: isNewRevealed,
          miniFee: miniLowFee,
          isFeeLoaded: true
        });
      } catch (e) {
        console.log('canceled');
      }
    };
    fetchFeesData();
  }, []);
  return { newFees, isFeeLoaded, miniFee, isRevealed };
};

export function changeAccountThunk(
  accountHash: string,
  parentHash: string,
  accountIndex: number,
  parentIndex: number,
  addressType: AddressType
) {
  return async dispatch => {
    dispatch(changeAccountAction(accountHash, parentHash, accountIndex, parentIndex, addressType));
    dispatch(syncAccountOrIdentityThunk(accountHash, parentHash, addressType));
  };
}

export function getNewVersionThunk() {
  return async dispatch => {
    const result = await getVersionFromApi();
    const RemoteVersionIndex = parseInt(result.currentVersionIndex, 10);
    if (RemoteVersionIndex > parseInt(LocalVersionIndex, 10)) {
      dispatch(addNewVersionAction(result.currentVersionString));
    }
  };
}
