import { TezosProtocolHelper } from 'conseiljs';
import { createMessageAction } from '../../reduxContent/message/actions';
import { updateIdentityAction } from '../../reduxContent/wallet/actions';
import { findIdentity } from '../../utils/identity';
import { findAccountIndex } from '../../utils/account';
import { saveIdentitiesToLocal } from '../../utils/wallet';
import { createTransaction } from '../../utils/transaction';
import { getMainNode, getMainPath } from '../../utils/settings';
import { DELEGATION } from '../../constants/TransactionTypes';

import { getSelectedKeyStore, clearOperationId } from '../../utils/general';

const { setDelegate } = TezosProtocolHelper;

export function delegateThunk(delegateAddress: string, fee: number, password: string) {
  return async (dispatch, state) => {
    const { selectedNode, nodesList, selectedPath, pathsList } = state().settings;
    const { identities, walletPassword } = state().wallet;
    const { selectedAccountHash, selectedParentHash, isLedger } = state().app;
    const mainNode = getMainNode(nodesList, selectedNode);
    const { tezosUrl } = mainNode;

    if (password !== walletPassword && !isLedger) {
      const error = 'components.messageBar.messages.incorrect_password';
      dispatch(createMessageAction(error, true));
      return false;
    }

    const keyStore = getSelectedKeyStore(
      identities,
      selectedParentHash,
      selectedParentHash,
      isLedger
    );
    const derivation = isLedger ? getMainPath(pathsList, selectedPath) : undefined;

    const res: any = await setDelegate(
      tezosUrl,
      keyStore,
      selectedAccountHash,
      delegateAddress,
      fee,
      derivation
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
        const error = 'components.messageBar.messages.delegation_operation_failed';
        console.error(error);
        dispatch(createMessageAction(error, true));
        return false;
      }

      const clearedOperationId = clearOperationId(res.operationGroupID);

      dispatch(
        createMessageAction(
          'components.messageBar.messages.success_delegation_update',
          false,
          clearedOperationId
        )
      );

      const transaction = createTransaction({
        delegate: delegateAddress,
        kind: DELEGATION,
        source: keyStore.publicKeyHash,
        operation_group_hash: clearedOperationId,
        fee
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
