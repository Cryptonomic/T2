import path from 'path';
import { TezosFileWallet, TezosLedgerWallet, StoreType } from 'conseiljs';
import { omit, pick } from 'lodash';

import { getLocalData, setLocalData } from './localData';
import { WalletState } from '../types/store';

const { saveWallet, loadWallet } = TezosFileWallet;
const { unlockAddress } = TezosLedgerWallet;

export async function saveUpdatedWallet(identities, walletLocation, walletFileName, password) {
  const completeWalletPath = path.join(walletLocation, walletFileName);
  return await saveWallet(completeWalletPath, { identities }, password);
}

function prepareToPersist(walletState: WalletState) {
  walletState.identities = walletState.identities.map(identity => {
    identity = omit(identity, ['publicKey', 'privateKey', 'activeTab']);
    identity.accounts = identity.accounts.map(account => {
      account = omit(account, ['publicKey', 'privateKey', 'activeTab']);
      return account;
    });

    return identity;
  });
  return pick(walletState, ['identities']);
}

export function persistWalletState(walletState: WalletState) {
  setLocalData('wallet', prepareToPersist(walletState));
}

// todo type
function prepareToLoad(savedWallet, localWallet): WalletState {
  const newWalletState = { ...savedWallet, ...localWallet };
  newWalletState.identities = savedWallet.identities.map(savedIdentity => {
    const foundIdentity = localWallet.identities.find(
      persistedIdentity => savedIdentity.publicKeyHash === persistedIdentity.publicKeyHash
    );

    if (foundIdentity) {
      savedIdentity = { ...savedIdentity, ...foundIdentity };
    }

    if (savedIdentity.accounts) {
      savedIdentity.accounts = savedIdentity.accounts.map(account => {
        return {
          ...account,
          ...pick(savedIdentity, ['publicKey', 'privateKey'])
        };
      });
    }

    return savedIdentity;
  });
  return newWalletState;
}

export async function loadPersistedState(walletPath, password) {
  const savedWallet = await loadWallet(walletPath, password).catch(err => {
    const errorObj = {
      name: 'components.messageBar.messages.invalid_wallet_password',
      ...err
    };
    console.error(errorObj);
    throw errorObj;
  });

  const localWallet = getLocalData('wallet');
  return prepareToLoad(savedWallet, localWallet);
}

export async function loadWalletFromLedger(derivationPath: string) {
  const identity = await unlockAddress(0, derivationPath).catch(err => {
    const errorObj = {
      name: 'components.messageBar.messages.ledger_not_connect'
    };
    console.error('TezosLedgerWallet.unlockAddress', err);
    throw errorObj;
  });

  identity.storeType = StoreType.Hardware;
  const ledgerWallet: any = { identities: [identity] };
  const localWallet = getLocalData('wallet');
  return prepareToLoad(ledgerWallet, localWallet);
}

export function initLedgerTransport() {
  TezosLedgerWallet.initLedgerTransport();
}
