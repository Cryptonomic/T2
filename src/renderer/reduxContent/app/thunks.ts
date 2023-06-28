import { OperationKindType, TezosParameterFormat, KeyStore, KeyStoreCurve, KeyStoreType } from 'conseiljs';
import firebase from 'firebase';
import { JSONPath } from 'jsonpath-plus';
import { useState, useEffect } from 'react';
import { useStore } from 'react-redux';
import uuid4 from 'uuid4';

import { changeAccountAction, addNewVersionAction, setSignerAction } from './actions';
import { syncAccountOrIdentityThunk } from '../wallet/thunks';
import { getMainNode } from '../../utils/settings';
import { getDataFromApi } from '../../utils/general';
import { getLocalData, setLocalData } from '../../utils/localData';
import { AVERAGEFEES, OPERATIONFEE, REVEALOPERATIONFEE } from '../../constants/FeeValue';
import config from '../../config.json';

import { AverageFees, AddressType } from '../../types/general';
import { RootState } from '../../types/store';

const { LocalVersionIndex, versionReferenceURL } = config;

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

export interface BakingBadInfo {
    address: string;
    name: string;
    fee: number;
    logoUrl: string;
    estimatedRoi: number;
}

export interface HarpoonInfo {
    address: string;
    grade: string;
    cycle: number;
}

export interface BakerInfo {
    address: string;
    name: string;
    grade: string;
}

const minimumOperationEstimate: OperationEstimate = { gas: 20_000, storage: 0, fee: 2_500 };

export const useFetchFees = (operationKind: OperationKindType, isReveal = false, isManager = false): FetchFees => {
    const [state, setState] = useState<FetchFees>(initialFeesState);
    const store = useStore<RootState>();
    const { newFees, isFeeLoaded, miniFee, isRevealed } = state;
    useEffect(() => {
        const fetchFeesData = async () => {
            try {
                const { selectedNode, nodesList } = store.getState().settings;
                const { conseilUrl, apiKey, network, tezosUrl } = getMainNode(nodesList, selectedNode);
                const serverFees = await window.conseiljs.TezosConseilClient.getFeeStatistics(
                    { url: conseilUrl, apiKey, network },
                    network,
                    operationKind
                ).catch(() => [AVERAGEFEES]);

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
                    isNewRevealed = await window.conseiljs.TezosNodeReader.isManagerKeyRevealedForAccount(tezosUrl, pkh).catch(() => false);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

                const estimate = await window.conseiljs.TezosNodeWriter.testContractInvocationOperation(
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
                    fee: Math.ceil(estimate.gas / 10 + 500), // TODO: 500 should be a settings item – "bakerVig", account for operation size
                });
            } catch (e) {
                console.log('estimateContractCall failed with ', e);
            }
        };

        estimateInvocation();
    }, []);

    return { gas, storage, fee };
};

const queryBakingBad = async (address: string): Promise<BakingBadInfo> => {
    try {
        if (!address) {
            return { address, name: '', fee: 0, logoUrl: '', estimatedRoi: 0 };
        }
        const responseJSON = await window.electron.fetchTimeout(`https://api.baking-bad.org/v2/bakers/${address}`, { timeout: 5000 });
        // const responseJSON = await response.json();
        if (responseJSON.error !== undefined && responseJSON.error.length > 0) {
            throw new Error(`BakingBad failed with ${responseJSON.error} for ${address}`);
        }

        return {
            address,
            name: responseJSON.name,
            fee: responseJSON.fee,
            logoUrl: responseJSON.logo || '',
            estimatedRoi: responseJSON.estimatedRoi,
        };
        // TODO: freeSpace, minDelegation, fee
    } catch (e) {
        console.log('queryBakingBad failed with ', e);
        return { address, name: '', fee: 0, logoUrl: '', estimatedRoi: 0 };
    }
};

export const queryTezosDomains = async (nodeUrl: string, address: string): Promise<string> => {
    try {
        const packedKey = await window.conseiljs.TezosMessageUtils.encodeBigMapKey(address, 'address', 'hex');
        const mapResult = await window.conseiljs.TezosNodeReader.getValueForBigMapKey(nodeUrl, 1265, packedKey);
        const domainBytes = JSONPath({ path: '$.args[0].args[1].args[0].bytes', json: mapResult })[0];
        return window.electron.buffer.fromString(domainBytes, 'hex');
    } catch (err) {
        return '';
    }
};

export const queryPrices = async () => {
    return window.electron
        .fetchTimeout(`https://api.coingecko.com/api/v3/simple/price?ids=tezos&vs_currencies=usd,eur,jpy`, { timeout: 5000 })
        .then((j) => j.tezos)
        .catch((e) => {
            return { usd: '-1', eur: '-1', jpy: '-1' };
        });
};

export const getBakerDetails = (accountAddress: string): string => {
    const [bakerName, setBakerName] = useState<string>('');

    useEffect(() => {
        let isSubscribed = true;
        const getData = async () => {
            const bakingbadResponse = await queryBakingBad(accountAddress);

            if (isSubscribed) {
                setBakerName(bakingbadResponse.name);
            }
        };

        getData();

        return () => {
            isSubscribed = false;
        };
    }, [bakerName]);

    return bakerName;
};

export const getTezosDomains = (accountAddress: string): string => {
    const store = useStore<RootState>();
    const { selectedNode, nodesList } = store.getState().settings;
    const { tezosUrl } = getMainNode(nodesList, selectedNode);

    const [domainName, setDomainName] = useState<string>('');

    useEffect(() => {
        let isSubscribed = true;
        const getData = async () => {
            const domainResponse = await queryTezosDomains(tezosUrl, accountAddress);

            if (isSubscribed) {
                setDomainName(domainResponse);
            }
        };

        getData();

        return () => {
            isSubscribed = false;
        };
    }, [domainName]);

    return domainName;
};

export const getPrices = (): { usd: string; eur: string; jpy: string } => {
    const [prices, setPrices] = useState<any>({ usd: '-1', eur: '-1', jpy: '-1' });
    const [priceTrigger, setPriceTrigger] = useState<string>('');

    useEffect(() => {
        let isSubscribed = true;
        const getData = async () => {
            const priceResponse = await queryPrices();

            if (isSubscribed) {
                setPrices(priceResponse);
                setPriceTrigger(JSON.stringify(priceResponse));
            }
        };

        getData();

        return () => {
            isSubscribed = false;
        };
    }, [priceTrigger]);

    const k = Object.keys(prices);
    return { usd: prices.usd, eur: prices.eur, jpy: prices.jpy };
};

export function changeAccountThunk(
    accountHash: string,
    parentHash: string,
    accountIndex: number,
    parentIndex: number,
    addressType: AddressType,
    tokenName?: string
): any {
    return async (dispatch: any) => {
        dispatch(changeAccountAction(accountHash, parentHash, accountIndex, parentIndex, addressType, tokenName));
        dispatch(syncAccountOrIdentityThunk(accountHash, parentHash, addressType));
    };
}

export function getNewVersionThunk(): any {
    return async (dispatch: any) => {
        const result = await getDataFromApi(versionReferenceURL);
        if (result && result.currentVersionIndex) {
            const RemoteVersionIndex = parseInt(result.currentVersionIndex, 10);
            if (RemoteVersionIndex > parseInt(LocalVersionIndex, 10)) {
                dispatch(addNewVersionAction(result.currentVersionString));
            }
        }
    };
}

export function registerTracingEvent(eventType: string) {
    if (!config.fireConf) {
        return;
    }

    return async () => {
        try {
            let tracingId = getLocalData('tracingId');
            if (!tracingId) {
                tracingId = uuid4();
                setLocalData('tracingId', tracingId);
            }

            firebase.initializeApp(config.fireConf);

            const eventId = uuid4();
            const ref = firebase.database().ref('users').child(tracingId).child('events').child(eventId);
            const event = {
                timestamp: Date.now(),
                name: eventType,
                version: LocalVersionIndex,
            };
            ref.set(event).catch((err: any) => {
                console.log('firebase error', err);
            });
        } catch {
            // eh
        }
    };
}

export function setSignerThunk(key: string, password: string) {
    if (!key || key.length === 0) {
        throw new Error('Empty key parameter in setSignerThunk()');
    }

    return async (dispatch: any) => {
        const signer = await window.conseiljsSoftSigner.SoftSigner.createSigner(key, password);
        dispatch(setSignerAction(signer));
    };
}

export function setLedgerSignerThunk(path: string) {
    return async (dispatch: any) => {
        await window.conseiljsLedgerSigner.LedgerSigner.createSigner(path);
        // dispatch(setSignerAction(signer));
    };
}
