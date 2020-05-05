import { shell } from 'electron';
import { TezosConseilClient, TezosNodeReader, TezosWalletUtil, StoreType, KeyStore } from 'conseiljs';
import { Node, NodeStatus } from '../types/general';

import { findIdentity } from './identity';
import * as status from '../constants/StatusTypes';
import { SEND, TRANSACTIONS } from '../constants/TabConstants';
import { blockExplorerHost, versionReferenceURL } from '../config.json';

const { Mnemonic, Hardware } = StoreType;

export async function getNodesStatus(node: Node): Promise<NodeStatus> {
    const { tezosUrl, conseilUrl, apiKey, network } = node;
    const tezRes: any = await TezosNodeReader.getBlockHead(tezosUrl).catch(err => {
        console.error(err);
        return false;
    });

    const consRes = await TezosConseilClient.getBlockHead({ url: conseilUrl, apiKey, network }, network).catch(err => {
        console.error(err);
        return false;
    });

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

// TODO: deprecate this
export function getSelectedKeyStore(
    identities: any[],
    selectedAccountHash: string,
    selectedParentHash: string,
    isLedger: boolean = false,
    mainPath?: string
): KeyStore {
    const identity = findIdentity(identities, selectedParentHash);
    const { publicKey, privateKey } = identity;
    return {
        publicKey,
        privateKey,
        publicKeyHash: selectedAccountHash,
        seed: '',
        storeType: isLedger ? StoreType.Hardware : StoreType.Mnemonic,
        derivationPath: isLedger ? mainPath : undefined
    };
}

export async function activateAndUpdateAccount(account, node: Node) {
    const { conseilUrl, network, apiKey } = node;
    const accountHash = account.publicKeyHash || account.account_id;
    if (account.status === status.READY || account.status === status.CREATED) {
        const updatedAccount: any = await TezosConseilClient.getAccount({ url: conseilUrl, apiKey, network }, network, accountHash).catch(error => {
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

export function isReady(addressStatus, storeType?, tab?) {
    return (
        addressStatus === status.READY ||
        (storeType === Mnemonic && addressStatus === status.CREATED && tab !== SEND) ||
        (storeType === Mnemonic && addressStatus !== status.CREATED && tab === TRANSACTIONS) ||
        (storeType === Hardware && addressStatus === status.CREATED && tab !== SEND)
    );
}

export function openLink(link) {
    shell.openExternal(link);
}

export function openBlockExplorerForOperation(operation: string, network: string = 'mainnet') {
    shell.openExternal(`${blockExplorerHost}/${network}/operations/${operation}`);
}

export function openBlockExplorerForAccount(account: string, network: string = 'mainnet') {
    shell.openExternal(`${blockExplorerHost}/${network}/accounts/${account}`);
}

export function clearOperationId(operationId) {
    if (typeof operationId === 'string') {
        return operationId.replace(/\\|"|\n|\r/g, '');
    }
    return operationId;
}

export const getVersionFromApi = async () => {
    try {
        const response = await fetch(versionReferenceURL);
        const responseJson = await response.json();
        return responseJson;
    } catch (error) {
        console.error(error);
    }
};
