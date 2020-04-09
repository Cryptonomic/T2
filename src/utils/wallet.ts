import path from 'path';
import { TezosFileWallet, TezosLedgerWallet, StoreType } from 'conseiljs';
import { omit, pick, unionBy, cloneDeep } from 'lodash';

import { getLocalData, setLocalData } from './localData';
import { createIdentity } from './identity';
import { combineAccounts } from './account';
import { WalletState } from '../types/store';
import { Identity } from '../types/general';
import { knownTokenContracts } from '../constants/Token';

const { saveWallet, loadWallet } = TezosFileWallet;
const { unlockAddress } = TezosLedgerWallet;

export async function saveUpdatedWallet(identities, walletLocation, walletFileName, password) {
  const completeWalletPath = path.join(walletLocation, walletFileName);
  return await saveWallet(completeWalletPath, { identities }, password);
}

// function prepareToPersist(walletState: WalletState) {
//   walletState.identities = walletState.identities.map(identity => {
//     identity = omit(identity, ['publicKey', 'privateKey', 'activeTab']);
//     identity.accounts = identity.accounts.map(account => {
//       account = omit(account, ['activeTab']);
//       return account;
//     });

//     return identity;
//   });
//   return pick(walletState, ['identities']);
// }

export function saveIdentitiesToLocal(identities: Identity[]) {
  let newIdentities = cloneDeep(identities);
  newIdentities = newIdentities.map(identity => {
    identity = omit(identity, ['publicKey', 'privateKey', 'activeTab']);
    identity.accounts = identity.accounts.map(account => {
      account = omit(account, ['activeTab']);
      return account;
    });
    return identity;
  });
  // identities.map(identity => {
  //   let newIdentity = { ...identity};
  //   newIdentity = omit(newIdentity, ['publicKey', 'privateKey', 'activeTab']);
  //   const accounts = newIdentity.accounts.map(account => {
  //     let newAcc = { ...account };
  //     newAcc = omit(newAcc, ['activeTab']);
  //     return newAcc;
  //   });
  //   return { ...newIdentity, accounts};
  // })
  setLocalData('identities', newIdentities);
}

// todo type
function prepareToLoad(serverIdentities, localIdentities): Identity[] {
  return serverIdentities.map((identity, index) => {
    const foundIdentity = localIdentities.find(
      localIdentity => identity.publicKeyHash === localIdentity.publicKeyHash
    );
    let newAccounts = identity.accounts || [];
    if (foundIdentity) {
      newAccounts = combineAccounts(newAccounts, foundIdentity.accounts);
    }
    return createIdentity({ ...identity, accounts: newAccounts, order: index + 1 });
  });
}

export async function loadPersistedState(
  walletPath: string,
  password: string
): Promise<Identity[]> {
  const { identities } = await loadWallet(walletPath, password).catch(err => {
    const errorObj = {
      name: 'components.messageBar.messages.invalid_wallet_password',
      ...err
    };
    console.error(errorObj);
    throw errorObj;
  });

  const localIdentities = getLocalData('identities');
  return prepareToLoad(identities, localIdentities);
}

export async function loadWalletFromLedger(derivationPath: string): Promise<Identity[]> {
  const identity = await unlockAddress(0, derivationPath).catch(err => {
    const errorObj = {
      name: 'components.messageBar.messages.ledger_not_connect'
    };
    console.error('TezosLedgerWallet.unlockAddress', err);
    throw errorObj;
  });

  identity.storeType = StoreType.Hardware;
  const identities = [identity];
  const localIdentities = getLocalData('identities');
  return prepareToLoad(identities, localIdentities);
}

export function initLedgerTransport() {
  TezosLedgerWallet.initLedgerTransport();
}

export function loadTokens() {
  const savedTokens = getLocalData('tokens');
  return knownTokenContracts.map(token => {
    const localTokens = savedTokens.filter(tk => tk.address === token.address);
    if (localTokens.length > 0) {
      return { ...localTokens[0], kind: token.kind };
    }
    return token;
  });
}
