import { shell } from 'electron';
import { pick } from 'lodash';
import {
  ConseilQueryBuilder,
  ConseilOperator,
  ConseilSortDirection,
  TezosConseilClient,
  TezosNodeReader,
  TezosWalletUtil,
  StoreType
} from 'conseiljs';
import { Node, NodeStatus, Identity, Account } from '../types/general';

// import { findAccount, createSelectedAccount } from './account';
// import { findIdentity } from './identity';
// import { createTransaction } from './transaction';
import * as status from '../constants/StatusTypes';
// import { TEZOS, CONSEIL } from '../constants/NodesTypes';
// import { SEND, TRANSACTIONS } from '../constants/TabConstants';
// import { getSelectedNode } from './nodes';
import { blockExplorerHost } from '../config.json';

// const util = require('util');
const { Mnemonic, Hardware } = StoreType;

export async function getNodesStatus(node: Node): Promise<NodeStatus> {
  const { tezosUrl, conseilUrl, apiKey, network } = node;
  const tezRes: any = await TezosNodeReader.getBlockHead(tezosUrl).catch(err => {
    console.error(err);
    return false;
  });

  const consRes = await TezosConseilClient.getBlockHead({ url: conseilUrl, apiKey }, network).catch(
    err => {
      console.error(err);
      return false;
    }
  );

  return {
    tezos: tezRes && tezRes.header ? Number(tezRes.header.level) : 0,
    conseil: consRes ? Number(consRes.level) : 0
  };
}

export function getNodesError({ tezos, conseil }: NodeStatus): string {
  if (!tezos || !conseil) {
    return 'nodes.errors.wrong_server';
  }

  if (conseil - tezos > 5) {
    return 'nodes.errors.wrong_network';
  }

  if (tezos - conseil > 5) {
    return 'nodes.errors.not_synced';
  }

  return '';
}

/**
 *
 * @param timeout - number of seconds to wait
 * @returns { Promise }
 */
// export function awaitFor(timeout: number) {
//   return new Promise((resolve) => {
//     setTimeout(resolve, timeout*1000);
//   });
// }

// export function getSelectedHash() {
//   let hash = location.hash.replace(/$\//, '');
//   let segments = hash.split('/');
//   const addressIndex = segments.pop();
//   const selectedParentHash = segments.pop();
//   const selectedAccountHash = segments.pop();
//   return {
//     selectedParentHash,
//     selectedAccountHash,
//     addressIndex
//   };
// }

// export function getSelectedAccount( identities, selectedAccountHash, selectedParentHash ) {
//   let selectedAccount = null;
//   if (selectedAccountHash === selectedParentHash) {
//     selectedAccount = findIdentity( identities, selectedAccountHash );
//   } else {
//     const identity = findIdentity( identities, selectedParentHash );
//     selectedAccount = findAccount( identity, selectedAccountHash );
//   }

//   return fromJS(selectedAccount || createSelectedAccount() );
// }

// export function getSelectedKeyStore( identities, selectedAccountHash, selectedParentHash ) {
//   var selectedAccount = getSelectedAccount( identities, selectedAccountHash, selectedParentHash );
//   const { publicKey, privateKey, publicKeyHash, account_id } = selectedAccount.toJS();
//   return {
//     publicKey,
//     privateKey,
//     publicKeyHash: publicKeyHash || account_id
//   };
// }

export async function activateAndUpdateAccount(account, node: Node) {
  const { conseilUrl, network, apiKey } = node;
  const accountHash = account.publicKeyHash || account.account_id;
  if (account.status === status.READY || account.status === status.CREATED) {
    const updatedAccount: any = await TezosConseilClient.getAccount(
      { url: conseilUrl, apiKey },
      network,
      accountHash
    ).catch(error => {
      console.log('-debug: Error in: status.READY for:' + accountHash);
      console.error(error);
      return null;
    });

    if (updatedAccount) {
      return {
        ...account,
        delegate_value: updatedAccount.delegate_value,
        balance: Number(updatedAccount.balance),
        status: status.READY
      };
    }
  }

  if (account.status === status.FOUND) {
    return {
      ...account,
      status: status.READY
    };
  }

  console.log('-debug: account.status ', account.status);
  return account;
}

export function generateNewMnemonic() {
  return TezosWalletUtil.generateMnemonic();
}

// export async function fetchAverageFees(settings, operationKind) {
//   const { url, apiKey } = getSelectedNode(settings, CONSEIL);
//   const { network } = settings;

//   const fees = await TezosConseilClient.getFeeStatistics({url, apiKey}, network, operationKind);

//   return {low: fees[0]['low'], medium: fees[0]['medium'], high: fees[0]['high']};
// }

// export function isReady(addressStatus, storeType, tab) {
//   return addressStatus === status.READY
//     ||
//     (storeType === Mnemonic && addressStatus === status.CREATED && tab !== SEND)
//     ||
//     (storeType === Mnemonic && addressStatus !== status.CREATED && tab === TRANSACTIONS)
//     ||
//     (storeType === Hardware && addressStatus === status.CREATED && tab !== SEND)
//     ;
// }

export function openLink(link) {
  shell.openExternal(link);
}

export function openLinkToBlockExplorer(url) {
  openLink(blockExplorerHost + url);
}

// export function clearOperationId( operationId ) {
//   if ( typeof operationId === 'string' ) {
//     return operationId.replace(/\\|"|\n|\r/g, '');
//   }
//   return operationId;
// }

export const getVersionFromApi = async () => {
  try {
    const response = await fetch('https://galleon-wallet.tech/version.json');
    const responseJson = await response.json();
    return responseJson;
  } catch (error) {
    console.error(error);
  }
};
