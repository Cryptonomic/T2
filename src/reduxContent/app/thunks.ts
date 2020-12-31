import { useState, useEffect } from 'react';
import { useStore } from 'react-redux';
import {
    TezosConseilClient,
    TezosNodeReader,
    TezosNodeWriter,
    OperationKindType,
    TezosMessageUtils,
    TezosParameterFormat,
    KeyStore,
    KeyStoreCurve,
    KeyStoreType,
} from 'conseiljs';
import { KeyStoreUtils, SoftSigner } from 'conseiljs-softsigner';
import { LedgerSigner, TezosLedgerConnector } from 'conseiljs-ledgersigner';

import { changeAccountAction, addNewVersionAction, setSignerAction } from './actions';
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

interface OperationEstimate {
    gas: number;
    storage: number;
    fee: number;
}

const initialFeesState: FetchFees = {
    newFees: AVERAGEFEES,
    isFeeLoaded: false,
    miniFee: OPERATIONFEE,
    isRevealed: true,
};

const minimumOperationEstimate: OperationEstimate = { gas: 20_000, storage: 0, fee: 2_500 };

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

/**
 * Calls the dry_run RPC endpoint to estimate a contract invocation operation.
 *
 * @param contractAddress Address of the contract to be called, KT1...
 * @param amount Amount in µtz to include in the operation
 * @param entryPoint Contract entry point to call
 * @param parameters Parameters to pass to the contract
 * @param parameterFormat Parameter format
 */
export const estimateContractCall = (
    accountAddress: string,
    contractAddress: string,
    amount: number,
    entryPoint: string,
    parameters: string,
    parameterFormat: TezosParameterFormat = TezosParameterFormat.Micheline
): OperationEstimate => {
    const store = useStore<RootState>();
    const [state, setState] = useState<OperationEstimate>(minimumOperationEstimate);
    const { gas, storage, fee } = state;
    const emptyKeyStore: KeyStore = { publicKey: '', secretKey: '', publicKeyHash: '', curve: KeyStoreCurve.ED25519, storeType: KeyStoreType.Mnemonic };

    useEffect(() => {
        const estimateInvocation = async () => {
            try {
                const { selectedNode, nodesList } = store.getState().settings;
                const { tezosUrl } = getMainNode(nodesList, selectedNode);

                const estimate = await TezosNodeWriter.testContractInvocationOperation(
                    tezosUrl,
                    'main',
                    { ...emptyKeyStore, publicKeyHash: accountAddress },
                    contractAddress,
                    amount,
                    500_000,
                    20_000,
                    1_040_000,
                    entryPoint,
                    parameters,
                    parameterFormat
                );

                setState({
                    gas: estimate.gas,
                    storage: estimate.storageCost,
                    fee: Math.ceil(estimate.gas / 10 + 500), // TODO: 500 should be a settings item – "bakerVig"
                });
            } catch (e) {
                console.log('estimateContractCall failed with ', e);
            }
        };

        estimateInvocation();
    }, []);
    console.log('calling estimate H');
    return { gas, storage, fee };
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
