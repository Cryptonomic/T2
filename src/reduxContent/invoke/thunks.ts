import { TezosNodeWriter, TezosParameterFormat } from 'conseiljs';
import { createMessageAction } from '../../reduxContent/message/actions';
import { updateIdentityAction } from '../../reduxContent/wallet/actions';
import { tezToUtez } from '../../utils/currency';

import { saveIdentitiesToLocal } from '../../utils/wallet';
import { createTransaction } from '../../utils/transaction';
import { TRANSACTION } from '../../constants/TransactionTypes';

import { getSelectedKeyStore, clearOperationId } from '../../utils/general';
import { getMainNode } from '../../utils/settings';

import { findAccountIndex } from '../../utils/account';
import { findIdentity } from '../../utils/identity';

const { sendContractInvocationOperation } = TezosNodeWriter;

export function invokeAddressThunk(
    contractAddress: string,
    fee: number,
    amount: string,
    storage: number,
    gas: number,
    parameters: string,
    password: string,
    selectedInvokeAddress: string,
    entryPoint: string,
    parameterFormat: TezosParameterFormat
) {
    return async (dispatch, state) => {
        const { selectedNode, nodesList } = state().settings;
        const { identities, walletPassword } = state().wallet;
        const { selectedParentHash, isLedger, signer } = state().app;
        const mainNode = getMainNode(nodesList, selectedNode);
        const { tezosUrl } = mainNode;

        if (password !== walletPassword && !isLedger) {
            const error = 'components.messageBar.messages.incorrect_password';
            dispatch(createMessageAction(error, true));
            return false;
        }

        const keyStore = getSelectedKeyStore(identities, selectedInvokeAddress, selectedParentHash, isLedger);
        const parsedAmount = tezToUtez(Number(amount.replace(/,/g, '.')));

        const realEntryPoint = entryPoint !== '' ? entryPoint : undefined;

        const estimate = await TezosNodeWriter.testContractInvocationOperation(
            tezosUrl,
            'main',
            keyStore,
            contractAddress,
            parsedAmount,
            fee,
            storage,
            gas,
            realEntryPoint,
            parameters,
            parameterFormat
        );

        const res: any = await sendContractInvocationOperation(
            tezosUrl,
            signer,
            keyStore,
            contractAddress,
            parsedAmount,
            fee,
            estimate.storageCost,
            estimate.gas,
            realEntryPoint,
            parameters,
            parameterFormat
        ).catch((err) => {
            const errorObj = { name: err.message, ...err };
            console.error(err);
            dispatch(createMessageAction(errorObj.name, true));
            return false;
        });

        console.log('invoke results-----', res);

        if (res) {
            const operationResult =
                res &&
                res.results &&
                res.results.contents &&
                res.results.contents[0] &&
                res.results.contents[0].metadata &&
                res.results.contents[0].metadata.operation_result;

            if (operationResult && operationResult.errors && operationResult.errors.length) {
                const error = 'components.messageBar.messages.invoke_operation_failed';
                console.error(operationResult.errors);
                dispatch(createMessageAction(error, true));
                return false;
            }

            const clearedOperationId = clearOperationId(res.operationGroupID);
            const consumedGas = operationResult.consumed_gas ? Number(operationResult.consumed_gas) : null;

            dispatch(createMessageAction('components.messageBar.messages.success_invoke_operation', false, clearedOperationId));

            const identity = findIdentity(identities, selectedParentHash);
            const transaction = createTransaction({
                amount: parsedAmount,
                destination: contractAddress,
                kind: TRANSACTION,
                source: keyStore.publicKeyHash,
                operation_group_hash: clearedOperationId,
                fee,
                gas_limit: gas,
                storage_limit: storage,
                parameters,
                consumed_gas: consumedGas,
            });

            if (selectedParentHash === selectedInvokeAddress) {
                identity.transactions.push(transaction);
            } else {
                const index = findAccountIndex(identity, selectedInvokeAddress);
                if (index > -1) {
                    identity.accounts[index].transactions.push(transaction);
                }
            }

            const accountIndex = findAccountIndex(identity, contractAddress);
            if (accountIndex > -1) {
                identity.accounts[accountIndex].transactions.push(transaction);
            }

            dispatch(updateIdentityAction(identity));

            await saveIdentitiesToLocal(state().wallet.identities);
            return true;
        }
        return false;
    };
}

export default invokeAddressThunk;
