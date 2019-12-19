import { TezosNodeWriter, TezosProtocolHelper } from 'conseiljs';
import { createMessageAction } from '../../reduxContent/message/actions';
import { updateIdentityAction } from '../../reduxContent/wallet/actions';

import { tezToUtez } from '../../utils/currancy';
import { displayError } from '../../utils/formValidation';
import { saveIdentitiesToLocal } from '../../utils/wallet';
import { createTransaction } from '../../utils/transaction';
import { TRANSACTION } from '../../constants/TransactionTypes';

import { getSelectedKeyStore, clearOperationId } from '../../utils/general';

import { findAccountIndex } from '../../utils/account';
import { findIdentity } from '../../utils/identity';
import { getMainNode, getMainPath } from '../../utils/settings';

const { sendTransactionOperation } = TezosNodeWriter;
const { sendDelegatedFunds } = TezosProtocolHelper;

export function validateAmountThunk(amount: string, toAddress: string) {
  return async dispatch => {
    const parsedAmount = Number(amount.replace(/,/g, '.'));
    const amountInUtez = tezToUtez(parsedAmount);

    const validations = [
      { value: amount, type: 'notEmpty', name: 'amount' },
      { value: parsedAmount, type: 'validAmount' },
      { value: amountInUtez, type: 'posNum', name: 'Amount' },
      { value: toAddress, type: 'validAddress' }
    ];

    const error = displayError(validations);
    if (error) {
      dispatch(createMessageAction(error, true));
      return false;
    }

    return true;
  };
}

export function sendTezThunk(password: string, toAddress: string, amount: string, fee: number) {
  return async (dispatch, state) => {
    const { selectedNode, nodesList, selectedPath, pathsList } = state().settings;
    const { identities, walletPassword } = state().wallet;
    const { selectedAccountHash, selectedParentHash, isLedger } = state().app;
    const mainNode = getMainNode(nodesList, selectedNode);
    const { tezosUrl } = mainNode;

    const keyStore = getSelectedKeyStore(
      identities,
      selectedAccountHash,
      selectedParentHash,
      isLedger
    );

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

    const derivation = isLedger ? getMainPath(pathsList, selectedPath) : undefined;

    const res: any = await sendTransactionOperation(
      tezosUrl,
      keyStore,
      toAddress,
      parsedAmount,
      fee,
      derivation
    ).catch(err => {
      const errorObj = { name: err.message, ...err };
      console.error(errorObj);
      dispatch(createMessageAction(errorObj.name, true));
      return false;
    });

    console.log('send results-----', res);

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

      const consumedGas = operationResult.consumed_gas
        ? Number(operationResult.consumed_gas)
        : null;

      const identity = findIdentity(identities, selectedParentHash);
      const clearedOperationId = clearOperationId(res.operationGroupID);
      const transaction = createTransaction({
        amount: parsedAmount,
        destination: toAddress,
        kind: TRANSACTION,
        source: keyStore.publicKeyHash,
        operation_group_hash: clearedOperationId,
        fee,
        consumed_gas: consumedGas
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

      dispatch(
        createMessageAction(
          'components.messageBar.messages.success_sent',
          false,
          clearedOperationId,
          Number(amount)
        )
      );
      return true;
    }
    return false;
  };
}

export function sendDelegatedFundsThunk(
  password: string,
  toAddress: string,
  amount: string,
  fee: number
) {
  return async (dispatch, state) => {
    const { selectedNode, nodesList, selectedPath, pathsList } = state().settings;
    const { identities, walletPassword } = state().wallet;
    const { selectedAccountHash, selectedParentHash, isLedger } = state().app;
    const mainNode = getMainNode(nodesList, selectedNode);
    const { tezosUrl } = mainNode;
    const keyStore = getSelectedKeyStore(
      identities,
      selectedParentHash,
      selectedParentHash,
      isLedger
    );

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
    const derivation = isLedger ? getMainPath(pathsList, selectedPath) : undefined;

    const res: any = await sendDelegatedFunds(
      tezosUrl,
      keyStore,
      selectedAccountHash,
      fee,
      parsedAmount,
      derivation,
      toAddress
    ).catch(err => {
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

      const consumedGas = operationResult.consumed_gas
        ? Number(operationResult.consumed_gas)
        : null;

      const identity = findIdentity(identities, selectedParentHash);
      const clearedOperationId = clearOperationId(res.operationGroupID);
      const transaction = createTransaction({
        amount: parsedAmount,
        destination: toAddress,
        kind: TRANSACTION,
        source: keyStore.publicKeyHash,
        operation_group_hash: clearedOperationId,
        fee,
        consumed_gas: consumedGas
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

      dispatch(
        createMessageAction(
          'components.messageBar.messages.success_sent',
          false,
          clearedOperationId,
          Number(amount)
        )
      );
      return true;
    }
    return false;
  };
}
