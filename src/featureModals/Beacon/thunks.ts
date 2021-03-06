import { useState, useEffect } from 'react';
import { useStore } from 'react-redux';
import { JSONPath } from 'jsonpath-plus';

import { TezosConstants, TezosNodeReader, TezosNodeWriter, TezosMessageUtils } from 'conseiljs';

import { cloneDecryptedSigner } from '../../utils/wallet';

import { RootState } from '../../types/store';

import { createMessageAction } from '../../reduxContent/message/actions';
import { getSelectedKeyStore, clearOperationId } from '../../utils/general';
import { getMainNode } from '../../utils/settings';

export function estimateOperationGroupFee(publicKeyHash: string, operations: any[]): number {
    // TODO: type
    const store = useStore<RootState>();
    const [fee, setFee] = useState<number>(0);

    useEffect(() => {
        const estimateInvocation = async () => {
            try {
                const { selectedNode, nodesList } = store.getState().settings;
                const { tezosUrl } = getMainNode(nodesList, selectedNode);

                let counter = await TezosNodeReader.getCounterForAccount(tezosUrl, publicKeyHash);
                const formedOperations: any[] = [];

                for (const o of operations) {
                    counter += 1;

                    switch (o.kind) {
                        case 'transaction': {
                            const op = TezosNodeWriter.constructContractInvocationOperation(
                                publicKeyHash,
                                counter,
                                o.destination,
                                o.amount,
                                0,
                                TezosConstants.OperationStorageCap,
                                TezosConstants.OperationGasCap,
                                o.parameters.entrypoint,
                                JSON.stringify(o.parameters.value)
                            );

                            formedOperations.push(op);

                            break;
                        }
                        default: {
                            break;
                        }
                    }
                }

                const estimate = await TezosNodeWriter.estimateOperationGroup(tezosUrl, 'main', formedOperations);

                setFee(estimate.estimatedFee);
            } catch (e) {
                console.log('estimateContractCall failed with ', e);
            }
        };

        estimateInvocation();
    }, []);

    return fee;
}

export function sendOperations(password: string, operations: any[]) {
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

        let counter = await TezosNodeReader.getCounterForAccount(tezosUrl, keyStore.publicKeyHash);
        const formedOperations: any[] = [];

        for (const o of operations) {
            counter += 1;

            switch (o.kind) {
                case 'transaction': {
                    const op = TezosNodeWriter.constructContractInvocationOperation(
                        keyStore.publicKeyHash,
                        counter,
                        o.destination,
                        o.amount,
                        0,
                        TezosConstants.OperationStorageCap,
                        TezosConstants.OperationGasCap,
                        o.parameters.entrypoint,
                        JSON.stringify(o.parameters.value)
                    );

                    formedOperations.push(op);

                    break;
                }
                default: {
                    break;
                }
            }
        }

        const estimate = await TezosNodeWriter.estimateOperationGroup(tezosUrl, 'main', formedOperations);

        for (let i = 0; i < formedOperations.length; i++) {
            if (i === 0) {
                formedOperations[i].fee = estimate.estimatedFee.toString();
            }

            formedOperations[i].gas_limit = estimate.operationResources[i].gas.toString();
            formedOperations[i].storage_limit = estimate.operationResources[i].storageCost.toString();
        }

        const result: any = await TezosNodeWriter.sendOperation(
            tezosUrl,
            formedOperations,
            isLedger ? signer : await cloneDecryptedSigner(signer, password)
        ).catch((err) => {
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

export function queryHicEtNuncSwap(swapId: number) {
    // TODO
    const store = useStore<RootState>();
    const [info, setInfo] = useState<any>({});

    useEffect(() => {
        const getSwapInfo = async () => {
            const { selectedNode, nodesList } = store.getState().settings;
            const { tezosUrl } = getMainNode(nodesList, selectedNode);

            const packedSwapId = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(swapId, 'int'), 'hex'));

            const swapInfo = await TezosNodeReader.getValueForBigMapKey(tezosUrl, 523, packedSwapId);

            const source = JSONPath({ path: '$.args[0].args[0].string', json: swapInfo })[0];
            const stock = Number(JSONPath({ path: '$.args[0].args[1].int', json: swapInfo })[0]);
            const nftId = Number(JSONPath({ path: '$.args[1].int', json: swapInfo })[0]);

            const packedNftId = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(nftId, 'int'), 'hex'));
            const nftInfo = await TezosNodeReader.getValueForBigMapKey(tezosUrl, 514, packedNftId);
            const ipfsUrlBytes = JSONPath({ path: '$.args[1][0].args[1].bytes', json: nftInfo })[0];
            const ipfsHash = Buffer.from(ipfsUrlBytes, 'hex').toString().slice(7);

            const nftDetails = await fetch(`https://cloudflare-ipfs.com/ipfs/${ipfsHash}`, { cache: 'no-store' });
            const nftDetailJson = await nftDetails.json();
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
