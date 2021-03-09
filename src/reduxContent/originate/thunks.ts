import { TezosNodeWriter, BabylonDelegationHelper, TezosParameterFormat } from 'conseiljs';
import { createMessageAction } from '../../reduxContent/message/actions';
import { updateIdentityAction } from '../../reduxContent/wallet/actions';
import { displayError } from '../../utils/formValidation';
import { tezToUtez } from '../../utils/currency';
import { createAccount } from '../../utils/account';
import { findIdentity } from '../../utils/identity';
import { getMainNode, getMainPath } from '../../utils/settings';
import { CREATED } from '../../constants/StatusTypes';
import { saveIdentitiesToLocal } from '../../utils/wallet';
import { createTransaction } from '../../utils/transaction';
import { ORIGINATION } from '../../constants/TransactionTypes';

import { getSelectedKeyStore, clearOperationId } from '../../utils/general';
import { cloneDecryptedSigner } from '../../utils/wallet';

const { sendContractOriginationOperation } = TezosNodeWriter;
const { deployManagerContract } = BabylonDelegationHelper;

export function originateContractThunk(
    delegate: string,
    amount: string,
    fee: number,
    passPhrase: string,
    publicKeyHash: string,
    storageLimit: number = 0,
    gasLimit: number = 0,
    code: string = '',
    storage: string = '',
    codeFormat?: TezosParameterFormat,
    isSmartContract: boolean = false
) {
    return async (dispatch, state) => {
        const { selectedNode, nodesList } = state().settings;
        const { identities, walletPassword } = state().wallet;
        const { isLedger, signer } = state().app;
        const mainNode = getMainNode(nodesList, selectedNode);
        const { tezosUrl } = mainNode;

        const parsedAmount = Number(amount.replace(/,/g, '.'));
        const amountInUtez = tezToUtez(parsedAmount);
        let validations: any[] = [];

        if (isLedger) {
            validations = [
                { value: amount, type: 'notEmpty', name: 'amount' },
                { value: parsedAmount, type: 'validAmount' },
                { value: amountInUtez, type: 'posNum', name: 'Amount' },
            ];
        } else {
            validations = [
                { value: amount, type: 'notEmpty', name: 'amount' },
                { value: parsedAmount, type: 'validAmount' },
                { value: amountInUtez, type: 'posNum', name: 'Amount' },
                { value: passPhrase, type: 'notEmpty', name: 'pass' },
                { value: passPhrase, type: 'minLength8', name: 'Pass Phrase' },
            ];
        }

        let error = displayError(validations);
        if (error) {
            dispatch(createMessageAction(error, true));
            return false;
        }

        if (passPhrase !== walletPassword && !isLedger) {
            error = 'components.messageBar.messages.incorrect_password';
            dispatch(createMessageAction(error, true));
            return false;
        }

        const identity = findIdentity(identities, publicKeyHash);
        const keyStore = getSelectedKeyStore(identities, publicKeyHash, publicKeyHash, isLedger);

        let newAddress;

        if (isSmartContract) {
            newAddress = await sendContractOriginationOperation(
                tezosUrl,
                isLedger ? signer : await cloneDecryptedSigner(signer, passPhrase),
                keyStore,
                amountInUtez,
                delegate.length > 0 ? delegate : undefined,
                fee,
                storageLimit,
                gasLimit,
                code,
                storage,
                codeFormat
            ).catch((err) => {
                const errorObj = { name: err.message, ...err };
                console.error(errorObj);
                dispatch(createMessageAction(errorObj.name, true));
                return false;
            });
        } else {
            newAddress = await deployManagerContract(
                tezosUrl,
                isLedger ? signer : await cloneDecryptedSigner(signer, passPhrase),
                keyStore,
                delegate,
                fee,
                amountInUtez
            ).catch((err) => {
                const errorObj = { name: err.message, ...err };
                console.error(errorObj);
                dispatch(createMessageAction(errorObj.name, true));
                return false;
            });
        }

        if (newAddress) {
            const operationResult1 = newAddress && newAddress.results && newAddress.results.contents && newAddress.results.contents.length;
            if (!operationResult1) {
                error = 'components.messageBar.messages.origination_operation_failed';
                console.error(error);
                dispatch(createMessageAction(error, true));
                return false;
            }
            const newOperation = newAddress.results.contents.find((content) => content.kind === 'origination');

            if (!newOperation) {
                error = 'components.messageBar.messages.origination_operation_failed';
                console.error(error);
                dispatch(createMessageAction(error, true));
                return false;
            }
            const operationResult = newOperation && newOperation.metadata && newOperation.metadata.operation_result;

            if (operationResult && operationResult.errors && operationResult.errors.length) {
                error = 'components.messageBar.messages.origination_operation_failed';
                console.error(error);
                dispatch(createMessageAction(error, true));
                return false;
            }

            const newAddressHash = operationResult.originated_contracts[0];
            const operationId = clearOperationId(newAddress.operationGroupID);

            identity.accounts.push(
                createAccount({
                    account_id: newAddressHash,
                    balance: amountInUtez,
                    operations: {
                        [CREATED]: operationId,
                    },
                    order: (identity.accounts.length || 0) + 1,
                    script: isSmartContract ? JSON.stringify(code) : '',
                    transactions: [],
                })
            );

            identity.transactions.push(
                createTransaction({
                    delegate,
                    kind: ORIGINATION,
                    operation_group_hash: operationId,
                    source: keyStore.publicKeyHash,
                    balance: amountInUtez,
                    originated_contracts: newAddressHash,
                    fee,
                })
            );

            const delegatedAddressee = identity.accounts.filter((account) => account.account_id === newAddressHash);
            delegatedAddressee[0].transactions.push(
                createTransaction({
                    amount: amountInUtez,
                    delegate,
                    kind: ORIGINATION,
                    operation_group_hash: operationId,
                    destination: keyStore.publicKeyHash,
                })
            );

            dispatch(updateIdentityAction(identity));

            // todo: add transaction
            if (isSmartContract) {
                dispatch(createMessageAction('components.messageBar.messages.success_contract_origination', false, operationId));
            } else {
                dispatch(createMessageAction('components.messageBar.messages.success_address_origination', false, operationId));
            }

            await saveIdentitiesToLocal(state().wallet.identities);
            return true;
        }

        return false;
    };
}
