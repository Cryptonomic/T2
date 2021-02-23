import { TezosNodeWriter, TezosNodeReader, BabylonDelegationHelper, TezosParameterFormat } from 'conseiljs';
import { createMessageAction } from '../../reduxContent/message/actions';
import { updateIdentityAction } from '../../reduxContent/wallet/actions';
import { tezToUtez } from '../../utils/currency';

import { saveIdentitiesToLocal, cloneDecryptedSigner } from '../../utils/wallet';
import { createTransaction } from '../../utils/transaction';
import { TRANSACTION, DELEGATION } from '../../constants/TransactionTypes';

import { getSelectedKeyStore, clearOperationId } from '../../utils/general';
import { getMainNode, getMainPath } from '../../utils/settings';

import { findAccountIndex } from '../../utils/account';
import { findIdentity } from '../../utils/identity';
import { displayError } from '../../utils/formValidation';

import { Node } from '../../types/general';

const { sendContractInvocationOperation, sendTransactionOperation } = TezosNodeWriter;
const { withdrawDelegatedFunds, depositDelegatedFunds, setDelegate, unSetDelegate, sendDelegatedFunds } = BabylonDelegationHelper;

export function delegateThunk(delegateAddress: string, fee: number, password: string) {
    return async (dispatch, state) => {
        const { selectedNode, nodesList, selectedPath, pathsList } = state().settings;
        const { identities, walletPassword } = state().wallet;
        const { selectedAccountHash, selectedParentHash, isLedger, signer } = state().app;
        const mainNode = getMainNode(nodesList, selectedNode);
        const { tezosUrl } = mainNode;

        if (password !== walletPassword && !isLedger) {
            const error = 'components.messageBar.messages.incorrect_password';
            dispatch(createMessageAction(error, true));
            return false;
        }

        // TODO: check delegate address change

        const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger);
        const derivation = isLedger ? getMainPath(pathsList, selectedPath) : undefined;

        let res: any;
        if (delegateAddress === '') {
            res = await unSetDelegate(tezosUrl, isLedger ? signer : await cloneDecryptedSigner(signer, password), keyStore, selectedAccountHash, fee).catch(
                (err) => {
                    const errorObj = { name: err.message, ...err };
                    console.error(errorObj);
                    dispatch(createMessageAction(errorObj.name, true));
                    return false;
                }
            );
        } else {
            res = await setDelegate(
                tezosUrl,
                isLedger ? signer : await cloneDecryptedSigner(signer, password),
                keyStore,
                selectedAccountHash,
                delegateAddress,
                fee
            ).catch((err) => {
                const errorObj = { name: err.message, ...err };
                console.error(errorObj);
                dispatch(createMessageAction(errorObj.name, true));
                return false;
            });
        }

        if (res) {
            const operationResult =
                res &&
                res.results &&
                res.results.contents &&
                res.results.contents[0] &&
                res.results.contents[0].metadata &&
                res.results.contents[0].metadata.operation_result;

            if (operationResult && operationResult.errors && operationResult.errors.length) {
                const error = 'components.messageBar.messages.delegation_operation_failed';
                console.error(error);
                dispatch(createMessageAction(error, true));
                return false;
            }

            const clearedOperationId = clearOperationId(res.operationGroupID);

            dispatch(createMessageAction('components.messageBar.messages.success_delegation_update', false, clearedOperationId));

            const transaction = createTransaction({
                delegate: delegateAddress,
                kind: DELEGATION,
                source: keyStore.publicKeyHash,
                operation_group_hash: clearedOperationId,
                fee,
            });

            const identity = findIdentity(identities, selectedParentHash);

            if (selectedParentHash === selectedAccountHash) {
                identity.transactions.push(transaction);
            } else {
                const accountIndex = findAccountIndex(identity, selectedAccountHash);
                if (accountIndex > -1) {
                    identity.accounts[accountIndex].transactions.push(transaction);
                }
            }

            dispatch(updateIdentityAction(identity));
            await saveIdentitiesToLocal(state().wallet.identities);
            return true;
        }
        return false;
    };
}

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
        const { selectedNode, nodesList, selectedPath, pathsList } = state().settings;
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
        const derivation = isLedger ? getMainPath(pathsList, selectedPath) : '';
        const parsedAmount = tezToUtez(amount);
        const realEntryPoint = entryPoint !== '' ? entryPoint : undefined;

        const res: any = await sendContractInvocationOperation(
            tezosUrl,
            isLedger ? signer : await cloneDecryptedSigner(signer, password),
            keyStore,
            contractAddress,
            parsedAmount,
            fee,
            storage,
            gas,
            realEntryPoint,
            parameters,
            parameterFormat
        ).catch((err) => {
            const errorObj = { name: err.message, ...err };
            console.error(`sendContractInvocationOperation failed with ${JSON.stringify(errorObj)}`);
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

export function withdrawThunk(fee: number, amount: string, password: string) {
    return async (dispatch, state): Promise<boolean> => {
        const { selectedNode, nodesList } = state().settings;
        const { identities, walletPassword } = state().wallet;
        const { selectedAccountHash, selectedParentHash, isLedger, signer } = state().app;
        const mainNode = getMainNode(nodesList, selectedNode);
        const { tezosUrl } = mainNode;

        if (password !== walletPassword && !isLedger) {
            const error = 'components.messageBar.messages.incorrect_password';
            dispatch(createMessageAction(error, true));
            return false;
        }

        const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger);

        const parsedAmount = tezToUtez(Number(amount.replace(/,/g, '.')));

        const res: any = await withdrawDelegatedFunds(
            tezosUrl,
            isLedger ? signer : await cloneDecryptedSigner(signer, password),
            keyStore,
            selectedAccountHash,
            fee,
            parsedAmount
        ).catch((err) => {
            const errorObj = { name: err.message, ...err };
            console.error(err);
            dispatch(createMessageAction(errorObj.name, true));
            return false;
        });

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

            dispatch(createMessageAction('components.messageBar.messages.success_invoke_operation', false, clearedOperationId));

            const identity = findIdentity(identities, selectedParentHash);
            const transaction = createTransaction({
                amount: parsedAmount,
                kind: TRANSACTION,
                source: keyStore.publicKeyHash,
                operation_group_hash: clearedOperationId,
                fee,
            });

            if (selectedParentHash === selectedAccountHash) {
                identity.transactions.push(transaction);
            } else {
                const accountIndex = findAccountIndex(identity, selectedAccountHash);
                if (accountIndex > -1) {
                    identity.accounts[accountIndex].transactions.push(transaction);
                }
            }

            dispatch(updateIdentityAction(identity));

            await saveIdentitiesToLocal(state().wallet.identities);
            return true;
        }
        return false;
    };
}

export function depositThunk(fee: number, amount: string, password: string, toAddress: string) {
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

        const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger);

        const parsedAmount = tezToUtez(Number(amount.replace(/,/g, '.')));

        const res: any = await depositDelegatedFunds(
            tezosUrl,
            isLedger ? signer : await cloneDecryptedSigner(signer, password),
            keyStore,
            toAddress,
            fee,
            parsedAmount
        ).catch((err) => {
            const errorObj = { name: err.message, ...err };
            console.error(err);
            dispatch(createMessageAction(errorObj.name, true));
            return false;
        });

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
            // const consumedGas = operationResult.consumed_gas
            //   ? Number(operationResult.consumed_gas)
            //   : null;

            dispatch(createMessageAction('components.messageBar.messages.success_invoke_operation', false, clearedOperationId));

            const identity = findIdentity(identities, selectedParentHash);
            const transaction = createTransaction({
                amount: parsedAmount,
                kind: TRANSACTION,
                source: keyStore.publicKeyHash,
                operation_group_hash: clearedOperationId,
                fee,
            });

            if (selectedParentHash === toAddress) {
                identity.transactions.push(transaction);
            } else {
                const accountIndex = findAccountIndex(identity, toAddress);
                if (accountIndex > -1) {
                    identity.accounts[accountIndex].transactions.push(transaction);
                }
            }

            dispatch(updateIdentityAction(identity));

            await saveIdentitiesToLocal(state().wallet.identities);
            return true;
        }
        return false;
    };
}

export function sendTezThunk(password: string, toAddress: string, amount: string, fee: number) {
    return async (dispatch, state) => {
        const { selectedNode, nodesList } = state().settings;
        const { identities, walletPassword } = state().wallet;
        const { selectedAccountHash, selectedParentHash, isLedger, signer } = state().app;
        const mainNode = getMainNode(nodesList, selectedNode);
        const { tezosUrl } = mainNode;

        const keyStore = getSelectedKeyStore(identities, selectedAccountHash, selectedParentHash, isLedger);

        if (password !== walletPassword && !isLedger) {
            const error = 'components.messageBar.messages.incorrect_password';
            dispatch(createMessageAction(error, true));
            return false;
        }

        if (toAddress === selectedAccountHash) {
            const error = 'components.messageBar.messages.cant_sent_yourself';
            dispatch(createMessageAction(error, true));
            return false;
        }

        const parsedAmount = tezToUtez(amount);

        const res: any = await sendTransactionOperation(
            tezosUrl,
            isLedger ? signer : await cloneDecryptedSigner(signer, password),
            keyStore,
            toAddress,
            parsedAmount,
            fee
        ).catch((err) => {
            const errorObj = { name: err.message, ...err };
            console.error(errorObj);
            dispatch(createMessageAction(errorObj.name, true));
            return false;
        });

        if (res) {
            const operationResult =
                res &&
                res.results &&
                res.results.contents &&
                res.results.contents[0] &&
                res.results.contents[0].metadata &&
                res.results.contents[0].metadata.operation_result;

            if (operationResult && operationResult.errors && operationResult.errors.length) {
                const error = 'components.messageBar.messages.send_operation_failed';
                console.error(error);
                dispatch(createMessageAction(error, true));
                return false;
            }

            const consumedGas = operationResult.consumed_gas ? Number(operationResult.consumed_gas) : null;

            const identity = findIdentity(identities, selectedParentHash);
            const clearedOperationId = clearOperationId(res.operationGroupID);
            const transaction = createTransaction({
                amount: parsedAmount,
                destination: toAddress,
                kind: TRANSACTION,
                source: keyStore.publicKeyHash,
                operation_group_hash: clearedOperationId,
                fee,
                consumed_gas: consumedGas,
            });

            if (selectedParentHash === selectedAccountHash) {
                identity.transactions.push(transaction);
            } else {
                const index = findAccountIndex(identity, selectedAccountHash);
                if (index > -1) {
                    identity.accounts[index].transactions.push(transaction);
                }
            }

            const accountIndex = findAccountIndex(identity, toAddress);
            if (accountIndex > -1) {
                identity.accounts[accountIndex].transactions.push(transaction);
            }

            dispatch(updateIdentityAction(identity));

            await saveIdentitiesToLocal(state().wallet.identities);

            dispatch(createMessageAction('components.messageBar.messages.success_sent', false, clearedOperationId, Number(amount)));
            return true;
        }
        return false;
    };
}

export function sendDelegatedFundsThunk(password: string, toAddress: string, amount: string, fee: number) {
    return async (dispatch, state) => {
        const { selectedNode, nodesList } = state().settings;
        const { identities, walletPassword } = state().wallet;
        const { selectedAccountHash, selectedParentHash, isLedger, signer } = state().app;
        const mainNode = getMainNode(nodesList, selectedNode);
        const { tezosUrl } = mainNode;
        const keyStore = getSelectedKeyStore(identities, selectedParentHash, selectedParentHash, isLedger);

        if (password !== walletPassword && !isLedger) {
            const error = 'components.messageBar.messages.incorrect_password';
            dispatch(createMessageAction(error, true));
            return false;
        }

        if (toAddress === selectedAccountHash) {
            const error = 'components.messageBar.messages.cant_sent_yourself';
            dispatch(createMessageAction(error, true));
            return false;
        }

        const parsedAmount = tezToUtez(Number(amount.replace(/,/g, '.')));

        const res: any = await sendDelegatedFunds(
            tezosUrl,
            isLedger ? signer : await cloneDecryptedSigner(signer, password),
            keyStore,
            selectedAccountHash,
            fee,
            parsedAmount,
            toAddress
        ).catch((err) => {
            const errorObj = { name: err.message, ...err };
            console.error(errorObj);
            dispatch(createMessageAction(errorObj.name, true));
            return false;
        });

        if (res) {
            const operationResult =
                res &&
                res.results &&
                res.results.contents &&
                res.results.contents[0] &&
                res.results.contents[0].metadata &&
                res.results.contents[0].metadata.operation_result;

            if (operationResult && operationResult.errors && operationResult.errors.length) {
                const error = 'components.messageBar.messages.send_operation_failed';
                console.error(error);
                dispatch(createMessageAction(error, true));
                return false;
            }

            const consumedGas = operationResult.consumed_gas ? Number(operationResult.consumed_gas) : null;

            const identity = findIdentity(identities, selectedParentHash);
            const clearedOperationId = clearOperationId(res.operationGroupID);
            const transaction = createTransaction({
                amount: parsedAmount,
                destination: toAddress,
                kind: TRANSACTION,
                source: keyStore.publicKeyHash,
                operation_group_hash: clearedOperationId,
                fee,
                consumed_gas: consumedGas,
            });

            if (selectedParentHash === selectedAccountHash) {
                identity.transactions.push(transaction);
            } else {
                const index = findAccountIndex(identity, selectedAccountHash);
                if (index > -1) {
                    identity.accounts[index].transactions.push(transaction);
                }
            }

            const accountIndex = findAccountIndex(identity, toAddress);
            if (accountIndex > -1) {
                identity.accounts[accountIndex].transactions.push(transaction);
            }

            dispatch(updateIdentityAction(identity));

            await saveIdentitiesToLocal(state().wallet.identities);

            dispatch(createMessageAction('components.messageBar.messages.success_sent', false, clearedOperationId, Number(amount)));
            return true;
        }
        return false;
    };
}

export async function getIsImplicitAndEmptyThunk(recipientHash: string, nodesList: Node[], selectedNode: string) {
    const mainNode = getMainNode(nodesList, selectedNode);
    const { tezosUrl } = mainNode;
    return await TezosNodeReader.isImplicitAndEmpty(tezosUrl, recipientHash);
}

export function validateAmountThunk(amount: string, toAddress: string) {
    return async (dispatch) => {
        const parsedAmount = Number(amount.replace(/,/g, '.'));
        const amountInUtez = tezToUtez(parsedAmount);

        const validations = [
            { value: amount, type: 'notEmpty', name: 'amount' },
            { value: parsedAmount, type: 'validAmount' },
            { value: amountInUtez, type: 'posNum', name: 'Amount' },
            { value: toAddress, type: 'validAddress' },
        ];

        const error = displayError(validations);
        if (error) {
            dispatch(createMessageAction(error, true));
            return false;
        }

        return true;
    };
}

export default invokeAddressThunk;
