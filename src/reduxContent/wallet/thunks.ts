import path from 'path';
import { push } from 'react-router-redux';
import {
  TezosFileWallet,
  TezosWalletUtil,
  TezosConseilClient,
  TezosNodeWriter,
  StoreType
} from 'conseiljs';
import { createMessageAction } from '../../reduxContent/message/actions';
import { CREATE, IMPORT } from '../../constants/CreationTypes';
import { FUNDRAISER, GENERATE_MNEMONIC, RESTORE } from '../../constants/AddAddressTypes';
import { CREATED } from '../../constants/StatusTypes';
import { createTransaction } from '../../utils/transaction';

import { findAccountIndex, getSyncAccount, syncAccountWithState } from '../../utils/account';

import {
  findIdentity,
  findIdentityIndex,
  createIdentity,
  getSyncIdentity,
  syncIdentityWithState
} from '../../utils/identity';

import { clearOperationId, getNodesStatus, getNodesError } from '../../utils/general';

import {
  saveUpdatedWallet,
  loadPersistedState,
  persistWalletState,
  loadWalletFromLedger
} from '../../utils/wallet';

import {
  setWalletAction,
  setIdentitiesAction,
  addNewIdentityAction,
  updateIdentityAction
} from './actions';

import {
  logoutAction,
  setIsLoadingAction,
  setWalletIsSyncingAction,
  setNodesStatusAction,
  updateFetchedTimeAction,
  setLedgerAction,
  setIsLedgerConnectingAction,
  changeAccountAction
} from '../app/actions';

import { getMainNode, getMainPath } from '../../utils/settings';
import { ACTIVATION } from '../../constants/TransactionTypes';
import { WalletState } from '../../types/store';

const { unlockFundraiserIdentity, unlockIdentityWithMnemonic } = TezosWalletUtil;
const { createWallet } = TezosFileWallet;

const { getAccount } = TezosConseilClient;

const { sendIdentityActivationOperation } = TezosNodeWriter;
let currentAccountRefreshInterval: any = null;

export function goHomeAndClearState() {
  return dispatch => {
    dispatch(logoutAction());
    clearAutomaticAccountRefresh();
    dispatch(push('/'));
  };
}

export function automaticAccountRefresh() {
  return dispatch => {
    const oneSecond = 1000; // milliseconds
    const oneMinute = 60 * oneSecond;
    const minutes = 1;
    const REFRESH_INTERVAL = minutes * oneMinute;

    if (currentAccountRefreshInterval) {
      clearAutomaticAccountRefresh();
    }

    currentAccountRefreshInterval = setInterval(
      () => dispatch(syncWalletThunk()),
      REFRESH_INTERVAL
    );
  };
}

export function clearAutomaticAccountRefresh() {
  clearInterval(currentAccountRefreshInterval);
}

export function updateAccountActiveTab(selectedAccountHash, selectedParentHash, activeTab) {
  return async (dispatch, state) => {
    const { identities } = state().wallet;
    const identity = findIdentity(identities, selectedParentHash);
    const foundIndex = findAccountIndex(identity, selectedAccountHash);
    const account = identity.accounts[foundIndex];

    if (foundIndex > -1) {
      identity.accounts[foundIndex] = {
        ...account,
        activeTab
      };

      dispatch(updateIdentityAction(identity));
    }
  };
}

export function updateIdentityActiveTab(selectedAccountHash, activeTab) {
  return async (dispatch, state) => {
    const { identities } = state().wallet;
    const identity = findIdentity(identities, selectedAccountHash);
    if (identity) {
      dispatch(
        updateIdentityAction({
          ...identity,
          activeTab
        })
      );
    }
  };
}

export function updateActiveTabThunk(activeTab) {
  return async (dispatch, state) => {
    const { selectedAccountHash, selectedParentHash } = state().app;
    if (selectedAccountHash === selectedParentHash) {
      dispatch(updateIdentityActiveTab(selectedAccountHash, activeTab));
    } else {
      dispatch(updateAccountActiveTab(selectedAccountHash, selectedParentHash, activeTab));
    }
  };
}

export function syncAccountThunk(selectedAccountHash, selectedParentHash) {
  return async (dispatch, state) => {
    const { selectedNode, nodesList } = state().settings;
    const { identities } = state().wallet;
    const mainNode = getMainNode(nodesList, selectedNode);

    const identity = findIdentity(identities, selectedParentHash);
    const accountIndex = findAccountIndex(identity, selectedAccountHash);
    let localAccount;
    let syncAccount;

    if (accountIndex > -1) {
      localAccount = { ...identity.accounts[accountIndex] };
      syncAccount = await getSyncAccount(
        localAccount,
        mainNode,
        selectedAccountHash,
        selectedAccountHash
      ).catch(e => {
        console.log(`-debug: Error in: syncAccount for:${identity.publicKeyHash}`);
        console.error(e);
        return syncAccount;
      });
    }

    identity.accounts[accountIndex] = syncAccountWithState(syncAccount, localAccount);
    dispatch(updateIdentityAction(identity));
    await persistWalletState(state().wallet);
  };
}

export function syncIdentityThunk(publicKeyHash) {
  return async (dispatch, state) => {
    const { selectedNode, nodesList } = state().settings;
    const { selectedAccountHash } = state().app;

    const mainNode = getMainNode(nodesList, selectedNode);
    const { identities } = state().wallet;
    const stateIdentity = findIdentity(identities, publicKeyHash);

    const syncIdentity = await getSyncIdentity(stateIdentity, mainNode, selectedAccountHash).catch(
      e => {
        console.log(`-debug: Error in: syncIdentity for:${publicKeyHash}`);
        console.error(e);
        return stateIdentity;
      }
    );

    dispatch(updateIdentityAction(syncIdentityWithState(syncIdentity, stateIdentity)));
    await persistWalletState(state().wallet);
  };
}

export function syncWalletThunk() {
  return async (dispatch, state) => {
    dispatch(setWalletIsSyncingAction(true));
    const { selectedNode, nodesList } = state().settings;
    const { selectedAccountHash } = state().app;

    const mainNode = getMainNode(nodesList, selectedNode);

    const nodesStatus = await getNodesStatus(mainNode);
    dispatch(setNodesStatusAction(nodesStatus));
    const res = getNodesError(nodesStatus);
    console.log('-debug: res, nodesStatus', res, nodesStatus);

    if (res) {
      dispatch(setWalletIsSyncingAction(false));
      return false;
    }

    const { identities } = state().wallet;
    const syncIdentities: any[] = await Promise.all(
      (identities || []).map(async identity => {
        const { publicKeyHash } = identity;
        const syncIdentity = await getSyncIdentity(identity, mainNode, selectedAccountHash).catch(
          e => {
            console.log(`-debug: Error in: syncIdentity for: ${publicKeyHash}`);
            console.error(e);
            return identity;
          }
        );
        return syncIdentity;
      })
    );

    const newIdentities = identities.filter(stateIdentity => {
      const syncIdentityIndex = syncIdentities.findIndex(
        syncIdentity => stateIdentity.publicKeyHash === syncIdentity.publicKeyHash
      );

      if (syncIdentityIndex > -1) {
        syncIdentities[syncIdentityIndex] = syncIdentityWithState(
          syncIdentities[syncIdentityIndex],
          stateIdentity
        );
        return false;
      }

      return true;
    });

    dispatch(setIdentitiesAction([...syncIdentities, ...newIdentities]));
    dispatch(updateFetchedTimeAction(new Date()));
    await persistWalletState(state().wallet);
    dispatch(setWalletIsSyncingAction(false));
  };
}

export function syncAccountOrIdentityThunk(selectedAccountHash, selectedParentHash) {
  return async dispatch => {
    try {
      dispatch(setWalletIsSyncingAction(true));
      if (selectedAccountHash === selectedParentHash) {
        await dispatch(syncIdentityThunk(selectedAccountHash));
      } else {
        await dispatch(syncAccountThunk(selectedAccountHash, selectedParentHash));
      }
    } catch (e) {
      console.log(
        `-debug: Error in: syncAccountOrIdentity for:${selectedAccountHash}`,
        selectedParentHash
      );
      console.error(e);
      dispatch(createMessageAction(e.name, true));
    }
    dispatch(setWalletIsSyncingAction(false));
  };
}

export function importAddressThunk(activeTab, seed, pkh, activationCode, username, passPhrase) {
  return async (dispatch, state) => {
    const { walletLocation, walletFileName, password, identities } = state().wallet;
    const { selectedNode, nodesList } = state().settings;
    const mainNode = getMainNode(nodesList, selectedNode);
    const { network, conseilUrl, tezosUrl, apiKey } = mainNode;
    // TODO: clear out message bar
    dispatch(createMessageAction('', false));
    dispatch(setIsLoadingAction(true));
    try {
      let identity: any = null;
      let activating;
      switch (activeTab) {
        case GENERATE_MNEMONIC:
          identity = await unlockIdentityWithMnemonic(seed, '');
          identity.storeType = StoreType.Mnemonic;
          break;
        case FUNDRAISER: {
          identity = await unlockFundraiserIdentity(
            seed,
            username.trim(),
            passPhrase.trim(),
            pkh.trim()
          );
          identity.storeType = StoreType.Fundraiser;
          const account = await getAccount(
            { url: conseilUrl, apiKey, network },
            network,
            identity.publicKeyHash
          ).catch(() => false);
          if (!account) {
            activating = await sendIdentityActivationOperation(
              tezosUrl,
              identity,
              activationCode
            ).catch(err => {
              const error = err;
              error.name = err.message;
              throw error;
            });
            const operationId = clearOperationId(activating.operationGroupID);
            dispatch(
              createMessageAction(
                'components.messageBar.messages.success_account_activation',
                false,
                operationId
              )
            );
            identity.operations = {
              [CREATED]: operationId
            };
          }
          break;
        }
        case RESTORE: {
          identity = await unlockIdentityWithMnemonic(seed, passPhrase);
          const storeTypesMap = {
            0: StoreType.Mnemonic,
            1: StoreType.Fundraiser
          };
          identity.storeType = storeTypesMap[identity.storeType];
          const account = await getAccount(
            { url: conseilUrl, apiKey, network },
            network,
            identity.publicKeyHash
          ).catch(() => false);
          if (!account) {
            const title = 'components.messageBar.messages.account_not_exist';
            const err = new Error(title);
            err.name = title;
            throw err;
          }
          break;
        }
        default:
          break;
      }
      if (identity) {
        const { publicKeyHash } = identity;
        if (findIdentityIndex(identities, publicKeyHash) === -1) {
          delete identity.seed;
          identity.order = identities.length + 1;
          identity = createIdentity(identity);
          if (activating !== undefined) {
            identity.transactions.push(
              createTransaction({
                kind: ACTIVATION,
                timestamp: Date.now(),
                operation_group_hash: identity.operations.Created,
                amount: activating.results.contents[0].metadata.balance_updates[0].change
              })
            );
          }
          dispatch(addNewIdentityAction(identity));
          dispatch(changeAccountAction(publicKeyHash, publicKeyHash, 0, 0, true));
          await saveUpdatedWallet(
            state().wallet.identities,
            walletLocation,
            walletFileName,
            password
          );
          await persistWalletState(state().wallet);
          dispatch(setIsLoadingAction(false));
          dispatch(push('/home'));
          await dispatch(syncAccountOrIdentityThunk(publicKeyHash, publicKeyHash));
        } else {
          dispatch(createMessageAction('components.messageBar.messages.identity_exist', true));
        }
      }
    } catch (e) {
      console.log(`-debug: Error in: importAddress for:${activeTab}`);
      console.error(e);
      if (e.name === "The provided string doesn't look like hex data") {
        dispatch(createMessageAction('general.errors.no_hex_data', true));
      } else {
        dispatch(createMessageAction(e.name, true));
      }
      dispatch(setIsLoadingAction(false));
    }
  };
}

// // todo: 3 on create account success add that account to file - incase someone closed wallet before ready was finish.
export function loginThunk(loginType, walletLocation, walletFileName, password) {
  return async dispatch => {
    const completeWalletPath = path.join(walletLocation, walletFileName);
    dispatch(setIsLoadingAction(true));
    dispatch(createMessageAction('', false));
    dispatch(setLedgerAction(false));
    try {
      let wallet: WalletState = {
        identities: [],
        walletFileName: '',
        walletLocation: '',
        password: ''
      };

      if (loginType === CREATE) {
        wallet = await createWallet(completeWalletPath, password);
      } else if (loginType === IMPORT) {
        wallet = await loadPersistedState(completeWalletPath, password);
      }

      const identities = wallet.identities.map((identity, identityIndex) => {
        return createIdentity({
          ...identity,
          order: identity.order || identityIndex + 1
        });
      });

      dispatch(setWalletAction(identities, walletLocation, walletFileName, password));
      if (identities.length > 0) {
        const { publicKeyHash } = identities[0];
        dispatch(changeAccountAction(publicKeyHash, publicKeyHash, 0, 0, true));
      }

      dispatch(automaticAccountRefresh());
      dispatch(setIsLoadingAction(false));
      dispatch(push('/home'));
      await dispatch(syncWalletThunk());
    } catch (e) {
      console.error(e);
      dispatch(setIsLoadingAction(false));
      dispatch(createMessageAction(e.name, true));
    }
  };
}

// todo: 3 on create account success add that account to file - incase someone closed wallet before ready was finish.
export function connectLedgerThunk() {
  return async (dispatch, state) => {
    const { selectedPath, pathsList } = state().settings;
    const derivation = getMainPath(pathsList, selectedPath);
    dispatch(setLedgerAction(true));
    dispatch(setIsLedgerConnectingAction(true));
    dispatch(setIsLoadingAction(true));
    dispatch(createMessageAction('', false));
    try {
      const wallet = await loadWalletFromLedger(derivation);
      const identities = wallet.identities.map((identity, identityIndex) => {
        return createIdentity({
          ...identity,
          order: identity.order || identityIndex + 1
        });
      });

      dispatch(setWalletAction(identities, '', `Ledger Nano S - ${derivation}`, ''));

      dispatch(automaticAccountRefresh());
      dispatch(push('/home'));
      await dispatch(syncWalletThunk());
    } catch (e) {
      console.error(e);
      dispatch(createMessageAction(e.name, true));
    }
    dispatch(setIsLoadingAction(false));
    dispatch(setIsLedgerConnectingAction(false));
  };
}
