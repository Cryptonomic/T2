import { useState, useEffect } from 'react';
import { useStore } from 'react-redux';
import { JSONPath } from 'jsonpath-plus';

import {
    TezosConstants,
    TezosNodeWriter,
    Delegation,
    Origination,
    Reveal,
    ConseilQueryBuilder,
    ConseilOperator,
    ConseilFunction,
    StackableOperation,
} from 'conseiljs';

import { RootState } from '../../types/store';

import { createMessageAction } from '../../reduxContent/message/actions';
import { getSelectedKeyStore, clearOperationId } from '../../utils/general';
import { getMainNode } from '../../utils/settings';

export function estimateOperationGroupFee(publicKeyHash: string, operations: StackableOperation[]): any {
    // TODO: type
    const store = useStore<RootState>();
    const [fee, setFee] = useState({ estimatedFee: 0, estimatedGas: 0, estimatedStorage: 0, feeError: '' });

    useEffect(() => {
        const estimateInvocation = async () => {
            try {
                const { selectedNode, nodesList } = store.getState().settings;
                const { tezosUrl } = getMainNode(nodesList, selectedNode);

                const { identities } = store.getState().wallet;
                const { isLedger } = store.getState().app;
                const keyStore = getSelectedKeyStore(identities, publicKeyHash, publicKeyHash, isLedger);

                const formedOperations = await createOperationGroup(operations, tezosUrl, publicKeyHash, keyStore.publicKey);
                const estimate = await window.conseiljs.TezosNodeWriter.estimateOperationGroup(tezosUrl, 'main', formedOperations);
                const estimatedGas = estimate.operationResources.reduce((a, c) => (a += c.gas), 0);
                const estimatedStorage = estimate.operationResources.reduce((a, c) => (a += c.storageCost), 0);
                setFee({ estimatedFee: estimate.estimatedFee, estimatedGas, estimatedStorage, feeError: '' });
            } catch (e) {
                const err = e as Error;
                console.log('estimateInvocation failed with ', e);
                setFee({ estimatedFee: -1, estimatedGas: -1, estimatedStorage: -1, feeError: err.message });
            }
        };

        estimateInvocation();
    }, []);

    return fee;
}

export function getAverageOperationGroupFee(publicKeyHash: string, operations: any[]): number | string {
    // TODO: type
    const store = useStore<RootState>();
    const [fee, setFee] = useState<number | string>(0);

    useEffect(() => {
        const estimateAverageFee = async () => {
            try {
                const { selectedNode, nodesList } = store.getState().settings;
                const { conseilUrl, apiKey, network, platform } = getMainNode(nodesList, selectedNode);
                const serverInfo = { url: conseilUrl, apiKey, network };

                let query = ConseilQueryBuilder.blankQuery();
                query = ConseilQueryBuilder.addFields(query, 'fee', 'gas_limit');
                query = ConseilQueryBuilder.addPredicate(query, 'timestamp', ConseilOperator.AFTER, [Date.now() - 7 * 24 * 60 * 60 * 1000], false);
                query = ConseilQueryBuilder.addPredicate(query, 'kind', ConseilOperator.EQ, ['transaction'], false);
                query = ConseilQueryBuilder.addPredicate(query, 'status', ConseilOperator.EQ, ['applied'], false);
                query = ConseilQueryBuilder.addPredicate(query, 'destination', ConseilOperator.IN, [operations.map((o) => o.destination)], false);
                // parameters_entrypoints
                query = ConseilQueryBuilder.addAggregationFunction(query, 'fee', ConseilFunction.avg);
                query = ConseilQueryBuilder.addAggregationFunction(query, 'gas_limit', ConseilFunction.avg);
                query = ConseilQueryBuilder.setLimit(query, 1);

                const result = await window.conseiljs.ConseilDataClient.executeEntityQuery(serverInfo, platform, network, 'operations', query).catch(() => []);

                setFee(Math.ceil(Number(result[0].avg_fee)));
            } catch (e: any) {
                console.log('estimateAverageFee failed with ', e);
                setFee(e.message);
            }
        };

        estimateAverageFee();
    }, []);

    return fee;
}

export function sendOperations(password: string, operations: any[], fee = 0, gasLimit = 0, storageLimit = 0): any {
    // TODO: type
    return async (dispatch, state): Promise<boolean> => {
        const { selectedNode, nodesList } = state().settings;
        const { identities, walletPassword } = state().wallet;
        const { selectedParentHash, isLedger, signer } = state().app;
        const mainNode = getMainNode(nodesList, selectedNode);
        const { tezosUrl } = mainNode;
        const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger);

        if (password !== walletPassword && !isLedger) {
            const error = 'components.messageBar.messages.incorrect_password';
            dispatch(createMessageAction(error, true));
            return false;
        }

        const formedOperations = await createOperationGroup(operations, tezosUrl, selectedParentHash, keyStore.publicKey);
        const estimate = await window.conseiljs.TezosNodeWriter.estimateOperationGroup(tezosUrl, 'main', formedOperations);

        formedOperations[0].fee = fee === 0 ? estimate.estimatedFee.toString() : fee.toString();

        if (fee === 0) {
            for (let i = 0; i < formedOperations.length; i++) {
                formedOperations[i].gas_limit = estimate.operationResources[i].gas.toString();
                formedOperations[i].storage_limit = estimate.operationResources[i].storageCost.toString();
            }
        } else {
            const totalEstimatedGas = estimate.operationResources.reduce((a, c) => (a += c.gas), 0);
            const totalEstimatedStorage = estimate.operationResources.reduce((a, c) => (a += c.storageCost), 0);

            for (let i = 0; i < formedOperations.length; i++) {
                formedOperations[i].gas_limit = Math.floor((estimate.operationResources[i].gas / totalEstimatedGas) * gasLimit).toString();
                formedOperations[i].storage_limit = Math.floor((estimate.operationResources[i].storageCost / totalEstimatedStorage) * storageLimit).toString();
            }
        }

        const result: any = await window.conseiljs.TezosNodeWriter.sendOperation(tezosUrl, formedOperations, isLedger, password).catch((err) => {
            const errorObj = { name: err.message, ...err };
            console.error(err);
            dispatch(createMessageAction(errorObj.name, true));
            return undefined;
        });

        if (result) {
            const operationResult =
                result &&
                result.results &&
                result.results.contents &&
                result.results.contents[0] &&
                result.results.contents[0].metadata &&
                result.results.contents[0].metadata.operation_result;

            if (operationResult && operationResult.errors && operationResult.errors.length) {
                const error = 'components.messageBar.messages.invoke_operation_failed';
                console.error('processOperationResult failed with', operationResult.errors);
                dispatch(createMessageAction(error, true));
                return false;
            }

            const clearedOperationId = clearOperationId(result.operationGroupID);
            dispatch(createMessageAction('components.messageBar.messages.success_invoke_operation', false, clearedOperationId));

            return true;
        }

        return false;
    };
}

async function createOperationGroup(operations, tezosUrl, publicKeyHash, publicKey) {
    const networkCounter = await window.conseiljs.TezosNodeReader.getCounterForAccount(tezosUrl, publicKeyHash);
    const formedOperations: any[] = [];

    let counter = networkCounter;
    for (const o of operations) {
        counter += 1;
        switch (o.kind) {
            case 'transaction': {
                let entrypoint: string | undefined;
                let parameters: string | undefined;

                try {
                    entrypoint = o.parameters.entrypoint;
                } catch {
                    //
                }

                try {
                    parameters = JSON.stringify(o.parameters.value);
                } catch {
                    //
                }

                const op = TezosNodeWriter.constructContractInvocationOperation(
                    publicKeyHash,
                    counter,
                    o.destination,
                    o.amount,
                    0,
                    TezosConstants.OperationStorageCap,
                    TezosConstants.OperationGasCap,
                    entrypoint,
                    parameters
                );

                formedOperations.push(op);

                break;
            }
            case 'delegation': {
                const op: Delegation = {
                    kind: 'delegation',
                    source: publicKeyHash,
                    fee: '0',
                    counter: counter.toString(),
                    storage_limit: TezosConstants.DefaultDelegationStorageLimit.toString(),
                    gas_limit: TezosConstants.DefaultDelegationGasLimit.toString(),
                    delegate: o.delegate,
                };

                formedOperations.push(op);

                break;
            }
            case 'origination': {
                const op: Origination = {
                    kind: 'origination',
                    source: publicKeyHash,
                    fee: '0',
                    counter: counter.toString(),
                    storage_limit: TezosConstants.DefaultDelegationStorageLimit.toString(),
                    gas_limit: TezosConstants.DefaultDelegationGasLimit.toString(),
                    balance: '0',
                    script: o.script,
                };

                formedOperations.push(op);

                break;
            }
            case 'reveal': {
                const op: Reveal = {
                    kind: 'reveal',
                    source: publicKeyHash,
                    fee: TezosConstants.DefaultKeyRevealFee.toString(),
                    counter: counter.toString(),
                    gas_limit: TezosConstants.DefaultKeyRevealGasLimit.toString(),
                    storage_limit: TezosConstants.DefaultKeyRevealStorageLimit.toString(),
                    public_key: o.public_key,
                };

                formedOperations.push(op);

                break;
            }
            default: {
                break;
            }
        }
    }

    return window.conseiljs.TezosNodeWriter.appendRevealOperation(tezosUrl, publicKey, publicKeyHash, networkCounter, formedOperations);
}

export function queryHicEtNuncSwap(swapId: number) {
    // TODO
    const store = useStore<RootState>();
    const [info, setInfo] = useState<any>({});

    useEffect(() => {
        const getSwapInfo = async () => {
            const { selectedNode, nodesList } = store.getState().settings;
            const { tezosUrl } = getMainNode(nodesList, selectedNode);

            const packedSwapId = await window.conseiljs.TezosMessageUtils.encodeBigMapKey(swapId, 'int', 'hex');

            const swapInfo = await window.conseiljs.TezosNodeReader.getValueForBigMapKey(tezosUrl, 523, packedSwapId);

            const source = JSONPath({ path: '$.args[0].args[0].string', json: swapInfo })[0];
            const stock = Number(JSONPath({ path: '$.args[0].args[1].int', json: swapInfo })[0]);
            const nftId = Number(JSONPath({ path: '$.args[1].int', json: swapInfo })[0]);

            const packedNftId = await window.conseiljs.TezosMessageUtils.encodeBigMapKey(nftId, 'int', 'hex');
            const nftInfo = await window.conseiljs.TezosNodeReader.getValueForBigMapKey(tezosUrl, 514, packedNftId);
            const ipfsUrlBytes = JSONPath({ path: '$.args[1][0].args[1].bytes', json: nftInfo })[0];
            const ipfsHash = window.electron.buffer.fromString(ipfsUrlBytes, 'hex').slice(7);

            const nftDetailJson = await window.electron.fetch(`https://cloudflare-ipfs.com/ipfs/${ipfsHash}`, { cache: 'no-store' });
            // const nftDetailJson = await nftDetails.json();
            const nftName = nftDetailJson.name;
            const nftDescription = nftDetailJson.description;
            const nftCreators = nftDetailJson.creators.join(', ');

            setInfo({
                source,
                stock,
                nftId,
                nftName,
                nftDescription,
                nftCreators,
            });
        };
        getSwapInfo();
    }, []);

    return info;
}
