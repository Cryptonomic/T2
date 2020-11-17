import { useState, useEffect } from 'react';
import { useStore } from 'react-redux';
import { TezosConseilClient, TezosNodeReader, OperationKindType, Signer, TezosMessageUtils } from 'conseiljs';
import { KeyStoreUtils, SoftSigner } from 'conseiljs-softsigner';
import { LedgerSigner, TezosLedgerConnector } from 'conseiljs-ledgersigner';
import { WalletClient } from '@airgap/beacon-sdk';

import { setModalOpen, setModalValue } from '../../reduxContent/modal/actions';
import { AppState } from '../../types/store';
import { changeAccountAction, addNewVersionAction, showSignVerifyAction, setSignerAction, setBeaconClientAction } from './actions';
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
    isRevealed: true,
};

export const useFetchFees = (operationKind: OperationKindType, isReveal: boolean = false, isManager: boolean = false): FetchFees => {
    const [state, setState] = useState<FetchFees>(initialFeesState);
    const store = useStore<RootState>();
    const { newFees, isFeeLoaded, miniFee, isRevealed } = state;
    useEffect(() => {
        const fetchFeesData = async () => {
            try {
                const { selectedNode, nodesList } = store.getState().settings;
                const { conseilUrl, apiKey, network, tezosUrl } = getMainNode(nodesList, selectedNode);
                const serverFees = await TezosConseilClient.getFeeStatistics({ url: conseilUrl, apiKey, network }, network, operationKind).catch(() => [
                    AVERAGEFEES,
                ]);
                const fees = {
                    low: serverFees[0].low,
                    medium: serverFees[0].medium,
                    high: serverFees[0].high,
                };
                let isNewRevealed = false;
                let miniLowFee = OPERATIONFEE;
                if (isReveal) {
                    const { selectedAccountHash, selectedParentHash } = store.getState().app;
                    const pkh = isManager ? selectedParentHash : selectedAccountHash;
                    isNewRevealed = await TezosNodeReader.isManagerKeyRevealedForAccount(tezosUrl, pkh).catch(() => false);
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
                    isFeeLoaded: true,
                });
            } catch (e) {
                console.log('canceled');
            }
        };
        fetchFeesData();
    }, []);
    return { newFees, isFeeLoaded, miniFee, isRevealed };
};

export function changeAccountThunk(accountHash: string, parentHash: string, accountIndex: number, parentIndex: number, addressType: AddressType) {
    return async (dispatch) => {
        dispatch(changeAccountAction(accountHash, parentHash, accountIndex, parentIndex, addressType));
        dispatch(syncAccountOrIdentityThunk(accountHash, parentHash, addressType));
    };
}

export function getNewVersionThunk() {
    return async (dispatch) => {
        const result = await getVersionFromApi();
        const RemoteVersionIndex = parseInt(result.currentVersionIndex, 10);
        if (RemoteVersionIndex > parseInt(LocalVersionIndex, 10)) {
            dispatch(addNewVersionAction(result.currentVersionString));
        }
    };
}

export function showSignVeiryThunk() {
    return async (dispatch) => {
        dispatch(showSignVerifyAction());
    };
}

export function setSignerThunk(key: string) {
    if (!key || key.length === 0) {
        throw new Error('Empty key parameter in setSignerThunk()');
    }

    return async (dispatch) => {
        const keyStore = await KeyStoreUtils.restoreIdentityFromSecretKey(key);
        const signer = await SoftSigner.createSigner(TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'));
        dispatch(setSignerAction(signer));
    };
}

export function setLedgerSignerThunk(path: string) {
    return async (dispatch) => {
        const signer = new LedgerSigner(await TezosLedgerConnector.getInstance(), path);
        dispatch(setSignerAction(signer));
    };
}

export function initBeaconThunk() {
    return async (dispatch, state) => {
        const { app } = state();
        if (app.beaconClient != null) {
            return;
        }

        const beaconClient = new WalletClient({ name: 'Beacon Wallet Client' });
        dispatch(setBeaconClientAction(beaconClient));

        await beaconClient.init();

        if ((await beaconClient.getPeers()).length > 0) {
            dispatch(connectBeaconThunk());
        }
    };
}

export function connectBeaconThunk() {
    return async (dispatch, state) => {
        const { app } = state();

        app.beaconClient.connect(async (message) => {
            dispatch(setModalValue(message, 'beaconEvent'));
            dispatch(setModalOpen(true, 'beaconEvent'));
        });
    };
}
