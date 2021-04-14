import path from 'path';
import { ipcRenderer } from 'electron';
import { push } from 'react-router-redux';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import {
    TezosNodeWriter,
    KeyStoreType,
    Tzip7ReferenceTokenHelper,
    TzbtcTokenHelper,
    WrappedTezosHelper,
    KolibriTokenHelper,
    ConseilServerInfo,
    TezosConseilClient,
    ConseilQueryBuilder,
    ConseilOperator,
    ConseilDataClient,
    TezosNodeReader,
} from 'conseiljs';
import { KeyStoreUtils } from 'conseiljs-softsigner';
import { createMessageAction } from '../../reduxContent/message/actions';
import { CREATE, IMPORT } from '../../constants/CreationTypes';
import { FUNDRAISER, GENERATE_MNEMONIC, RESTORE } from '../../constants/AddAddressTypes';
import { CREATED } from '../../constants/StatusTypes';
import { createTransaction } from '../../utils/transaction';
import { TokenKind, VaultToken, ArtToken } from '../../types/general';

import { findAccountIndex, getSyncAccount, syncAccountWithState } from '../../utils/account';

import { findIdentity, findIdentityIndex, createIdentity, getSyncIdentity, syncIdentityWithState } from '../../utils/identity';

import { clearOperationId, getNodesStatus, getNodesError, getSelectedKeyStore } from '../../utils/general';

import { saveUpdatedWallet, loadPersistedState, saveIdentitiesToLocal, loadWalletFromLedger, loadTokens, cloneDecryptedSigner } from '../../utils/wallet';

import { findTokenIndex } from '../../utils/token';

import { setWalletAction, setIdentitiesAction, addNewIdentityAction, updateIdentityAction, updateTokensAction } from './actions';

import {
    logoutAction,
    setIsLoadingAction,
    setWalletIsSyncingAction,
    setNodesStatusAction,
    updateFetchedTimeAction,
    setLedgerAction,
    setIsLedgerConnectingAction,
    changeAccountAction,
} from '../app/actions';

import * as HicNFTUtil from '../../contracts/HicNFT/util';

import { setSignerThunk, setLedgerSignerThunk } from '../app/thunks';

import { getMainNode, getMainPath } from '../../utils/settings';
import { createWallet } from '../../utils/wallet';
import { ACTIVATION } from '../../constants/TransactionTypes';
import { Identity, Token, AddressType } from '../../types/general';

import * as tzbtcUtil from '../../contracts/TzBtcToken/util';
import * as tzip7Util from '../../contracts/TokenContract/util';
import * as wxtzUtil from '../../contracts/WrappedTezos/util';

const { restoreIdentityFromFundraiser, restoreIdentityFromMnemonic, restoreIdentityFromSecretKey } = KeyStoreUtils;

const { sendIdentityActivationOperation } = TezosNodeWriter;
let currentAccountRefreshInterval: any = null;

export function goHomeAndClearState() {
    return (dispatch) => {
        dispatch(logoutAction());
        clearAutomaticAccountRefresh();
        dispatch(push('/'));
    };
}

export function automaticAccountRefresh() {
    return (dispatch) => {
        if (currentAccountRefreshInterval) {
            clearAutomaticAccountRefresh();
        }

        currentAccountRefreshInterval = setInterval(() => dispatch(syncWalletThunk()), 60_000);
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
            identity.accounts[foundIndex] = { ...account, activeTab };

            dispatch(updateIdentityAction(identity));
        }
    };
}

export function updateIdentityActiveTab(selectedAccountHash, activeTab) {
    return async (dispatch, state) => {
        const { identities } = state().wallet;
        const identity = findIdentity(identities, selectedAccountHash);
        if (identity) {
            dispatch(updateIdentityAction({ ...identity, activeTab }));
        }
    };
}

export function updateActiveTabThunk(activeTab: string, isToken?: boolean) {
    return async (dispatch, state) => {
        const { selectedAccountHash, selectedParentHash } = state().app;
        if (isToken) {
            const { tokens } = state().wallet;
            const tokenIndex = findTokenIndex(tokens, selectedAccountHash);
            tokens[tokenIndex] = { ...tokens[tokenIndex], activeTab };
            dispatch(updateTokensAction([...tokens]));
        } else if (selectedAccountHash === selectedParentHash) {
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
            syncAccount = await getSyncAccount(localAccount, mainNode, selectedAccountHash, selectedAccountHash).catch((e) => {
                console.log(`-debug: Error in: syncAccount for:${identity.publicKeyHash}`);
                console.error(e);
                return syncAccount;
            });
        }

        identity.accounts[accountIndex] = syncAccountWithState(syncAccount, localAccount);
        dispatch(updateIdentityAction(identity));
        await saveIdentitiesToLocal(state().wallet.identities);
    };
}

export function syncIdentityThunk(publicKeyHash) {
    return async (dispatch, state) => {
        const { selectedNode, nodesList } = state().settings;
        const { selectedAccountHash } = state().app;

        const mainNode = getMainNode(nodesList, selectedNode);
        const { identities } = state().wallet;
        const stateIdentity = findIdentity(identities, publicKeyHash);

        const syncIdentity = await getSyncIdentity(stateIdentity, mainNode, selectedAccountHash).catch((e) => {
            console.log(`-debug: Error in: syncIdentity for:${publicKeyHash}`);
            console.error(e);
            return stateIdentity;
        });

        dispatch(updateIdentityAction(syncIdentityWithState(syncIdentity, stateIdentity)));
        await saveIdentitiesToLocal(state().wallet.identities);
    };
}

export function syncTokenThunk(tokenAddress) {
    return async (dispatch, state) => {
        const { selectedNode, nodesList } = state().settings;
        const { selectedParentHash } = state().app;
        const tokens: (Token | VaultToken | ArtToken)[] = state().wallet.tokens;

        if (!selectedParentHash || selectedParentHash.length === 0) {
            return;
        }

        const mainNode = getMainNode(nodesList, selectedNode);
        const tokenIndex = findTokenIndex(tokens, tokenAddress);

        if (tokenIndex > -1) {
            let balanceAsync;
            let transAsync;
            let detailsAsync;
            let ovenAddresses: string[] = [];

            const serverInfo: ConseilServerInfo = {
                url: mainNode.conseilUrl,
                apiKey: mainNode.apiKey,
                network: mainNode.network,
            };
            const mapid = tokens[tokenIndex].mapid || 0;

            if (tokens[tokenIndex].kind === TokenKind.tzip7 || tokens[tokenIndex].kind === TokenKind.usdtz || tokens[tokenIndex].kind === TokenKind.ethtz) {
                balanceAsync = Tzip7ReferenceTokenHelper.getAccountBalance(mainNode.tezosUrl, mapid, selectedParentHash);
                detailsAsync = Tzip7ReferenceTokenHelper.getSimpleStorage(mainNode.tezosUrl, tokens[tokenIndex].address).then(async (d) => {
                    const keyCount = await TezosConseilClient.countKeysInMap(serverInfo, mapid);
                    return { ...d, holders: keyCount };
                });
                transAsync = tzip7Util.syncTokenTransactions(
                    tokenAddress,
                    selectedParentHash,
                    mainNode,
                    tokens[tokenIndex].transactions,
                    tokens[tokenIndex].kind
                );
            } else if (tokens[tokenIndex].kind === TokenKind.tzbtc) {
                balanceAsync = TzbtcTokenHelper.getAccountBalance(mainNode.tezosUrl, mapid, selectedParentHash);
                transAsync = tzbtcUtil.syncTokenTransactions(tokenAddress, selectedParentHash, mainNode, tokens[tokenIndex].transactions);
            } else if (tokens[tokenIndex].kind === TokenKind.wxtz) {
                const vaultToken = tokens[tokenIndex] as VaultToken;
                const coreContractAddress = vaultToken.vaultCoreAddress;
                const vaultListBigMapId = vaultToken.vaultRegistryMapId;

                balanceAsync = WrappedTezosHelper.getAccountBalance(mainNode.tezosUrl, mapid, selectedParentHash);
                transAsync = tzbtcUtil.syncTokenTransactions(tokenAddress, selectedParentHash, mainNode, tokens[tokenIndex].transactions);
                detailsAsync = WrappedTezosHelper.getSimpleStorage(mainNode.tezosUrl, tokens[tokenIndex].address).then(async (d) => {
                    const keyCount = await TezosConseilClient.countKeysInMap(serverInfo, mapid);
                    return { ...d, holders: keyCount };
                });

                try {
                    ovenAddresses = await WrappedTezosHelper.listOvens(serverInfo, coreContractAddress, selectedParentHash, vaultListBigMapId);
                } catch {
                    // ignore empty list
                }
            } else if (tokens[tokenIndex].kind === TokenKind.kusd) {
                balanceAsync = KolibriTokenHelper.getAccountBalance(mainNode.tezosUrl, mapid, selectedParentHash);
                detailsAsync = KolibriTokenHelper.getSimpleStorage(mainNode.tezosUrl, tokens[tokenIndex].address).then(async (d) => {
                    const keyCount = await TezosConseilClient.countKeysInMap(serverInfo, mapid);
                    return { ...d, holders: keyCount };
                });
                transAsync = tzip7Util.syncTokenTransactions(
                    tokenAddress,
                    selectedParentHash,
                    mainNode,
                    tokens[tokenIndex].transactions,
                    tokens[tokenIndex].kind
                );
            } else if (tokens[tokenIndex].kind === TokenKind.objkt) {
                balanceAsync = HicNFTUtil.getCollectionSize(511, selectedParentHash, mainNode);
                detailsAsync = await HicNFTUtil.getTokenInfo(mainNode, 515).then((r) => {
                    return { holders: r.holders, supply: r.totalBalance };
                });
                transAsync = [];
            } else if (tokens[tokenIndex].kind === TokenKind.blnd) {
                balanceAsync = WrappedTezosHelper.getAccountBalance(mainNode.tezosUrl, mapid, selectedParentHash);
                detailsAsync = WrappedTezosHelper.getSimpleStorage(mainNode.tezosUrl, tokens[tokenIndex].address).then(async (d) => {
                    const keyCount = await TezosConseilClient.countKeysInMap(serverInfo, mapid);

                    return { ...d, holders: keyCount };
                });
                transAsync = tzip7Util.syncTokenTransactions(
                    tokenAddress,
                    selectedParentHash,
                    mainNode,
                    tokens[tokenIndex].transactions,
                    tokens[tokenIndex].kind
                );
            } else if (tokens[tokenIndex].kind === TokenKind.stkr) {
                balanceAsync = WrappedTezosHelper.getAccountBalance(mainNode.tezosUrl, mapid, selectedParentHash);
                detailsAsync = WrappedTezosHelper.getSimpleStorage(mainNode.tezosUrl, tokens[tokenIndex].address).then(async (d) => {
                    const keyCount = await TezosConseilClient.countKeysInMap(serverInfo, mapid);

                    return { ...d, holders: keyCount };
                });
                transAsync = tzip7Util.syncTokenTransactions(
                    tokenAddress,
                    selectedParentHash,
                    mainNode,
                    tokens[tokenIndex].transactions,
                    tokens[tokenIndex].kind
                );
            }

            try {
                const [balance, transactions, details] = await Promise.all([balanceAsync, transAsync, detailsAsync]);
                tokens[tokenIndex] = { ...tokens[tokenIndex], balance, transactions, details };
            } catch (awaitError) {
                console.log('awaitError', awaitError);
            }

            // Apply an optional update for vaultList
            if (ovenAddresses.length > 0) {
                // TODO: move up
                const ovenPromises = ovenAddresses.map(async (ovenAddress: string) => {
                    const ovenBalance = await TezosNodeReader.getSpendableBalanceForAccount(mainNode.tezosUrl, ovenAddress);
                    const block: any = await TezosNodeReader.getAccountForBlock(mainNode.tezosUrl, 'head', ovenAddress);
                    const baker = block.delegate as string;

                    return {
                        ovenAddress,
                        ovenOwner: selectedParentHash,
                        ovenBalance,
                        baker,
                    };
                });
                const vaultList = await Promise.all(ovenPromises);

                tokens[tokenIndex] = { ...tokens[tokenIndex], vaultList };
            }

            dispatch(updateTokensAction([...tokens]));
        }
    };
}

export function syncWalletThunk() {
    return async (dispatch, state) => {
        dispatch(setWalletIsSyncingAction(true));
        const { selectedNode, nodesList } = state().settings;
        const { selectedAccountHash, selectedParentHash } = state().app;
        const tokens: (Token | VaultToken | ArtToken)[] = state().wallet.tokens;

        if (!selectedParentHash || selectedParentHash.length === 0) {
            return;
        }

        const mainNode = getMainNode(nodesList, selectedNode);

        const nodesStatus = await getNodesStatus(mainNode);
        dispatch(setNodesStatusAction(nodesStatus));
        const res = getNodesError(nodesStatus);

        if (res) {
            dispatch(setWalletIsSyncingAction(false));
            return false;
        }

        const { identities } = state().wallet;
        const syncIdentities: any[] = await Promise.all(
            (identities || []).map(async (identity) => {
                const { publicKeyHash } = identity;
                const syncIdentity = await getSyncIdentity(identity, mainNode, selectedAccountHash).catch((e) => {
                    console.log(`-debug: Error in: syncIdentity for: ${publicKeyHash}`);
                    console.error(e);
                    return identity;
                });
                return syncIdentity;
            })
        );

        const newTokens = await Promise.all(
            tokens.map(async (token) => {
                console.log('processing token', token);
                if (token.kind === TokenKind.tzip7 || token.kind === TokenKind.usdtz || token.kind === TokenKind.ethtz) {
                    try {
                        const validCode = await Tzip7ReferenceTokenHelper.verifyDestination(mainNode.tezosUrl, token.address);
                        if (!validCode) {
                            console.log(`warning, code fingerprint mismatch for token: ${JSON.stringify(token)}`);
                        }
                    } catch {
                        console.log(`warning, code fingerprint mismatch for token: ${JSON.stringify(token)}`);
                    }

                    let mapid = token.mapid;
                    let administrator = token.administrator;

                    const details = await Tzip7ReferenceTokenHelper.getSimpleStorage(mainNode.tezosUrl, token.address).catch(() => undefined);
                    mapid = details?.mapid || -1;
                    if (token.mapid && token.mapid > mapid) {
                        mapid = token.mapid;
                    }
                    administrator = details?.administrator || '';

                    if (mapid === -1) {
                        console.log(`warning, could not process token: ${JSON.stringify(token)}`);
                        return { ...token, mapid, administrator, balance: 0 };
                    }

                    const balance = await Tzip7ReferenceTokenHelper.getAccountBalance(mainNode.tezosUrl, mapid, selectedParentHash).catch(() => 0);
                    const transactions = await tzip7Util.syncTokenTransactions(
                        token.address,
                        selectedParentHash,
                        mainNode,
                        token.transactions,
                        token.kind
                    ); /* TODO */

                    return { ...token, mapid, administrator, balance, transactions, details };
                } else if (token.kind === TokenKind.tzbtc) {
                    try {
                        const validCode = await TzbtcTokenHelper.verifyDestination(mainNode.tezosUrl, token.address);
                        if (!validCode) {
                            console.log(`warning, tzbtc fingerprint mismatch for token: ${JSON.stringify(token)}`);
                        }
                    } catch {
                        console.log(`warning, tzbtc fingerprint mismatch for token: ${JSON.stringify(token)}`);
                    }

                    let mapid = token.mapid;
                    const administrator = token.administrator || '';

                    if (!mapid || mapid === -1) {
                        const newStorage = await TzbtcTokenHelper.getSimpleStorage(mainNode.tezosUrl, token.address).catch(() => {
                            return { mapid: -1 };
                        });
                        mapid = newStorage.mapid;
                    }

                    if (mapid === -1) {
                        console.log(`warning, could not process token: ${JSON.stringify(token)}`);
                        return { ...token, mapid, administrator, balance: 0 };
                    }

                    const balance = await TzbtcTokenHelper.getAccountBalance(mainNode.tezosUrl, mapid, selectedParentHash).catch(() => 0);
                    const transactions = await tzbtcUtil.syncTokenTransactions(token.address, selectedParentHash, mainNode, token.transactions); /* TODO */

                    return { ...token, mapid, administrator, balance, transactions };
                } else if (token.kind === TokenKind.wxtz) {
                    const vaultToken = token as VaultToken;
                    let mapid = vaultToken.mapid || 0;

                    if (!mapid || mapid === -1) {
                        const newStorage = await WrappedTezosHelper.getSimpleStorage(mainNode.tezosUrl, token.address).catch(() => {
                            return { balanceMap: -1 };
                        });
                        mapid = newStorage.balanceMap;
                    }

                    const balance = await WrappedTezosHelper.getAccountBalance(mainNode.tezosUrl, mapid, selectedParentHash).catch(() => 0);
                    const transactions = await wxtzUtil.syncTokenTransactions(token.address, selectedParentHash, mainNode, token.transactions);

                    const coreContractAddress = vaultToken.vaultCoreAddress;

                    const vaultListBigMapId = vaultToken.vaultRegistryMapId;
                    const serverInfo: ConseilServerInfo = {
                        url: mainNode.conseilUrl,
                        apiKey: mainNode.apiKey,
                        network: mainNode.network,
                    };

                    let vaultList: any[] = [];
                    try {
                        const ovenAddresses = await WrappedTezosHelper.listOvens(serverInfo, coreContractAddress, selectedParentHash, vaultListBigMapId);
                        if (ovenAddresses.length > 0) {
                            const ovenPromises = ovenAddresses.map(async (ovenAddress: string) => {
                                const ovenBalance = await TezosNodeReader.getSpendableBalanceForAccount(mainNode.tezosUrl, ovenAddress);
                                const block: any = await TezosNodeReader.getAccountForBlock(mainNode.tezosUrl, 'head', ovenAddress);
                                const baker = block.delegate as string;

                                return {
                                    ovenAddress,
                                    ovenOwner: selectedParentHash,
                                    ovenBalance,
                                    baker,
                                };
                            });
                            vaultList = await Promise.all(ovenPromises);
                        }
                    } catch {
                        // ignore empty list
                    }

                    return { ...token, mapid, administrator: '', balance, transactions, vaultList };
                } else if (token.kind === TokenKind.kusd) {
                    try {
                        const validCode = await KolibriTokenHelper.verifyDestination(mainNode.tezosUrl, token.address);
                        if (!validCode) {
                            console.log(`warning, code fingerprint mismatch for token: ${JSON.stringify(token)}`);
                        }
                    } catch {
                        console.log(`warning, code fingerprint mismatch for token: ${JSON.stringify(token)}`);
                    }

                    let mapid = token.mapid || 0;
                    let administrator = token.administrator;
                    const serverInfo: ConseilServerInfo = {
                        url: mainNode.conseilUrl,
                        apiKey: mainNode.apiKey,
                        network: mainNode.network,
                    };

                    let details: any = await KolibriTokenHelper.getSimpleStorage(mainNode.tezosUrl, token.address).catch(() => undefined);
                    mapid = details?.mapid || -1;
                    if (token.mapid && token.mapid > mapid) {
                        mapid = token.mapid;
                    }
                    administrator = details?.administrator || '';

                    if (mapid === -1) {
                        console.log(`warning, could not process token: ${JSON.stringify(token)}`);
                        return { ...token, mapid, administrator, balance: 0 };
                    }

                    const keyCount = await TezosConseilClient.countKeysInMap(serverInfo, mapid);
                    details = { ...details, holders: keyCount };

                    const balance = await KolibriTokenHelper.getAccountBalance(mainNode.tezosUrl, mapid, selectedParentHash).catch(() => 0);
                    const transactions = await tzip7Util.syncTokenTransactions(
                        token.address,
                        selectedParentHash,
                        mainNode,
                        token.transactions,
                        token.kind
                    ); /* TODO */

                    return { ...token, mapid, administrator, balance, transactions, details };
                } else if (token.kind === TokenKind.objkt) {
                    const artToken = token as ArtToken;
                    const mapid = 511;
                    const administrator = '';

                    // const details = await Tzip7ReferenceTokenHelper.getSimpleStorage(mainNode.tezosUrl, token.address).catch(() => undefined);
                    const balance = await HicNFTUtil.getCollectionSize(mapid, selectedParentHash, mainNode);
                    const transactions = []; // await HicNFTUtil.getTokenTransactions('', selectedParentHash, selectedNode);

                    return { ...artToken, mapid, administrator, balance, transactions };
                } else if (token.kind === TokenKind.blnd) {
                    let mapid = token.mapid || 0;
                    let administrator = token.administrator;
                    const serverInfo: ConseilServerInfo = {
                        url: mainNode.conseilUrl,
                        apiKey: mainNode.apiKey,
                        network: mainNode.network,
                    };

                    let details: any = await WrappedTezosHelper.getSimpleStorage(mainNode.tezosUrl, token.address).catch((e) => {
                        console.log('Caught: ' + e);
                        return undefined;
                    });
                    mapid = details?.mapid || -1;
                    if (token.mapid && token.mapid > mapid) {
                        mapid = token.mapid;
                    }
                    administrator = details?.administrator || '';

                    if (mapid === -1) {
                        console.log(`warning, could not process token: ${JSON.stringify(token)}`);
                        return { ...token, mapid, administrator, balance: 0 };
                    }

                    const keyCount = await TezosConseilClient.countKeysInMap(serverInfo, mapid);
                    details = { ...details, holders: keyCount };

                    const balance = await WrappedTezosHelper.getAccountBalance(mainNode.tezosUrl, mapid, selectedParentHash).catch(() => 0);
                    const transactions = await tzip7Util.syncTokenTransactions(
                        token.address,
                        selectedParentHash,
                        mainNode,
                        token.transactions,
                        token.kind
                    ); /* TODO */

                    return { ...token, mapid, administrator, balance, transactions, details };
                } else if (token.kind === TokenKind.stkr) {
                    let mapid = token.mapid || 0;
                    let administrator = token.administrator;
                    const serverInfo: ConseilServerInfo = {
                        url: mainNode.conseilUrl,
                        apiKey: mainNode.apiKey,
                        network: mainNode.network,
                    };

                    let details: any = await WrappedTezosHelper.getSimpleStorage(mainNode.tezosUrl, token.address).catch((e) => {
                        console.log('Caught: ' + e);
                        return undefined;
                    });
                    mapid = details?.mapid || -1;
                    if (token.mapid && token.mapid > mapid) {
                        mapid = token.mapid;
                    }
                    administrator = details?.administrator || '';

                    if (mapid === -1) {
                        console.log(`warning, could not process token: ${JSON.stringify(token)}`);
                        return { ...token, mapid, administrator, balance: 0 };
                    }

                    const keyCount = await TezosConseilClient.countKeysInMap(serverInfo, mapid);
                    details = { ...details, holders: keyCount };

                    const balance = await WrappedTezosHelper.getAccountBalance(mainNode.tezosUrl, mapid, selectedParentHash).catch(() => 0);
                    const transactions = await tzip7Util.syncTokenTransactions(
                        token.address,
                        selectedParentHash,
                        mainNode,
                        token.transactions,
                        token.kind
                    ); /* TODO */

                    return { ...token, mapid, administrator, balance, transactions, details };
                } else {
                    console.warn(`warning, unsupported token: ${JSON.stringify(token)}`);
                    return { ...token, mapid: -1, administrator: '', balance: 0, transactions: [] };
                }
            })
        );

        dispatch(updateTokensAction(newTokens));
        dispatch(setIdentitiesAction(syncIdentities));
        dispatch(updateFetchedTimeAction(new Date()));
        await saveIdentitiesToLocal(state().wallet.identities);
        dispatch(setWalletIsSyncingAction(false));
    };
}

export function syncAccountOrIdentityThunk(selectedAccountHash, selectedParentHash, addressType) {
    return async (dispatch) => {
        try {
            dispatch(setWalletIsSyncingAction(true));
            if (
                addressType === AddressType.Token ||
                addressType === AddressType.TzBTC ||
                addressType === AddressType.wXTZ ||
                addressType === AddressType.kUSD ||
                addressType === AddressType.objkt ||
                addressType === AddressType.BLND ||
                addressType === AddressType.STKR
            ) {
                await dispatch(syncTokenThunk(selectedAccountHash));
            } else if (selectedAccountHash === selectedParentHash) {
                await dispatch(syncIdentityThunk(selectedAccountHash));
            } else {
                await dispatch(syncAccountThunk(selectedAccountHash, selectedParentHash));
            }
        } catch (e) {
            console.log(`-debug: Error in: syncAccountOrIdentity for: ${selectedAccountHash}`, selectedParentHash, addressType);
            console.error(e);
            dispatch(createMessageAction(e.name, true));
        }
        dispatch(setWalletIsSyncingAction(false));
    };
}

function setTokensThunk() {
    return (dispatch, state) => {
        const { selectedNode, nodesList } = state().settings;
        const mainNode = getMainNode(nodesList, selectedNode);
        const tokens = loadTokens(mainNode.network);
        dispatch(updateTokensAction(tokens));
    };
}

export function importAddressThunk(activeTab, seed, pkh?, activationCode?, username?, passPhrase?, derivationPath?: string) {
    return async (dispatch, state) => {
        const { walletLocation, walletFileName, walletPassword, identities } = state().wallet;
        const { selectedNode, nodesList } = state().settings;
        const mainNode = getMainNode(nodesList, selectedNode);
        const { network, conseilUrl, tezosUrl, apiKey } = mainNode;

        dispatch(createMessageAction('', false));
        dispatch(setIsLoadingAction(true));
        try {
            let identity: any = null;
            let activating;
            switch (activeTab) {
                case GENERATE_MNEMONIC:
                    identity = await restoreIdentityFromMnemonic(seed, '');
                    identity.storeType = KeyStoreType.Mnemonic;
                    await dispatch(setSignerThunk(identity.secretKey, walletPassword));
                    break;
                case FUNDRAISER: {
                    identity = await restoreIdentityFromFundraiser(seed, username.trim(), passPhrase.trim(), pkh.trim());
                    identity.storeType = KeyStoreType.Fundraiser;
                    await dispatch(setSignerThunk(identity.secretKey, walletPassword));

                    let query = ConseilQueryBuilder.blankQuery();
                    query = ConseilQueryBuilder.addFields(query, 'pkh');
                    query = ConseilQueryBuilder.addPredicate(query, 'pkh', ConseilOperator.EQ, [identity.publicKeyHash], false);
                    query = ConseilQueryBuilder.addPredicate(query, 'kind', ConseilOperator.EQ, ['activate_account'], false);
                    query = ConseilQueryBuilder.setLimit(query, 1);

                    const account = await ConseilDataClient.executeEntityQuery(
                        { url: conseilUrl, apiKey, network },
                        'tezos',
                        network,
                        'operations',
                        query
                    ).catch(() => []);
                    if (!account || account.length === 0) {
                        const keyStore = getSelectedKeyStore([identity], identity.publicKeyHash, identity.publicKeyHash, false);
                        const newKeyStore = { ...keyStore, storeType: KeyStoreType.Fundraiser };
                        activating = await sendIdentityActivationOperation(
                            tezosUrl,
                            await cloneDecryptedSigner(state().app.signer, walletPassword),
                            newKeyStore,
                            activationCode
                        ).catch((err) => {
                            throw new Error(`Count not activate account, due to – ${err.message}`);
                        });

                        const operationId = clearOperationId(activating.operationGroupID);
                        dispatch(createMessageAction('components.messageBar.messages.success_account_activation', false, operationId));
                        identity.operations = {
                            [CREATED]: operationId,
                        };
                    }
                    break;
                }
                case RESTORE: {
                    let keyPath: string | undefined;
                    if (derivationPath !== undefined && derivationPath.length > 0) {
                        keyPath = derivationPath;
                    }

                    identity = await restoreIdentityFromMnemonic(seed, passPhrase, undefined, keyPath, false);
                    const storeTypesMap = {
                        0: KeyStoreType.Mnemonic,
                        1: KeyStoreType.Fundraiser,
                    };
                    identity.storeType = storeTypesMap[identity.storeType];
                    await dispatch(setSignerThunk(identity.secretKey, walletPassword));
                    const account = await TezosConseilClient.getAccount({ url: conseilUrl, apiKey, network }, network, identity.publicKeyHash).catch(
                        () => false
                    );
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
                                amount: activating.results.contents[0].metadata.balance_updates[0].change,
                            })
                        );
                    }
                    dispatch(addNewIdentityAction(identity));
                    dispatch(setSignerThunk(identity.secretKey, walletPassword));
                    dispatch(setTokensThunk());
                    dispatch(changeAccountAction(publicKeyHash, publicKeyHash, 0, 0, AddressType.Manager));
                    await saveUpdatedWallet(state().wallet.identities, walletLocation, walletFileName, walletPassword);
                    await saveIdentitiesToLocal(state().wallet.identities);
                    dispatch(setIsLoadingAction(false));
                    dispatch(push('/home'));
                    await dispatch(syncAccountOrIdentityThunk(publicKeyHash, publicKeyHash, AddressType.Manager));
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

export function importSecretKeyThunk(key) {
    return async (dispatch, state) => {
        const { walletLocation, walletFileName, walletPassword, identities } = state().wallet;

        dispatch(createMessageAction('', false));
        dispatch(setIsLoadingAction(true));
        try {
            let identity: any = null;
            identity = await restoreIdentityFromSecretKey(key);
            identity.storeType = KeyStoreType.Mnemonic;

            if (identity) {
                const { publicKeyHash } = identity;
                if (findIdentityIndex(identities, publicKeyHash) === -1) {
                    delete identity.seed;
                    identity.order = identities.length + 1;
                    identity = createIdentity(identity);

                    dispatch(addNewIdentityAction(identity));
                    dispatch(changeAccountAction(publicKeyHash, publicKeyHash, 0, 0, AddressType.Manager));
                    await saveUpdatedWallet(state().wallet.identities, walletLocation, walletFileName, walletPassword);

                    await saveIdentitiesToLocal(state().wallet.identities);
                    dispatch(setIsLoadingAction(false));
                    dispatch(push('/home'));
                    await dispatch(syncAccountOrIdentityThunk(publicKeyHash, publicKeyHash, AddressType.Manager));
                } else {
                    dispatch(createMessageAction('components.messageBar.messages.identity_exist', true));
                }
            }
        } catch (e) {
            console.error(`Error restoring account from secret key: ${e}`);
            if (e.name === "The provided string doesn't look like hex data") {
                dispatch(createMessageAction('general.errors.no_hex_data', true));
            } else {
                dispatch(createMessageAction(e.name, true));
            }
            dispatch(setIsLoadingAction(false));
        }
    };
}

export function loginThunk(loginType, walletLocation, walletFileName, password) {
    return async (dispatch, state) => {
        const completeWalletPath = path.join(walletLocation, walletFileName);
        dispatch(setIsLoadingAction(true));
        dispatch(createMessageAction('', false));
        dispatch(setLedgerAction(false));
        try {
            let identities: Identity[] = [];

            if (loginType === CREATE) {
                const wallet = await createWallet(completeWalletPath, password);
                identities = wallet.identities.map((identity, index) => {
                    return createIdentity({
                        ...identity,
                        order: index + 1,
                    });
                });
            } else if (loginType === IMPORT) {
                identities = await loadPersistedState(completeWalletPath, password);
            }

            dispatch(setWalletAction(identities, walletLocation, walletFileName, password));
            if (identities.length > 0) {
                const { publicKeyHash, secretKey } = identities[0];
                dispatch(changeAccountAction(publicKeyHash, publicKeyHash, 0, 0, AddressType.Manager));
                dispatch(setSignerThunk(secretKey, password));
            }

            dispatch(setTokensThunk());

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

export function connectLedgerThunk() {
    return async (dispatch, state) => {
        const { selectedPath, pathsList } = state().settings;
        const osPlatform = ipcRenderer.sendSync('os-platform');
        const derivation = getMainPath(pathsList, selectedPath);
        dispatch(setLedgerAction(true));
        dispatch(setIsLedgerConnectingAction(true));
        dispatch(setIsLoadingAction(true));
        dispatch(createMessageAction('', false));
        const devicesList = await TransportNodeHid.list();
        if (devicesList.length === 0) {
            dispatch(createMessageAction('general.errors.no_ledger_detected', true));
        } else {
            try {
                const identities = await loadWalletFromLedger(derivation);
                dispatch(setWalletAction(identities, '', `Ledger device - ${derivation}`, ''));
                dispatch(setTokensThunk());
                const { publicKeyHash } = identities[0];
                dispatch(changeAccountAction(publicKeyHash, publicKeyHash, 0, 0, AddressType.Manager));
                dispatch(setLedgerSignerThunk(derivation));
                dispatch(automaticAccountRefresh());
                dispatch(push('/home'));
                await dispatch(syncWalletThunk());
            } catch (e) {
                console.error(e);
                let message = e.name;
                if (osPlatform === 'linux') {
                    message = 'components.messageBar.messages.ledger_linux_error';
                }
                dispatch(createMessageAction(message, true, 'https://cryptonomic.zendesk.com/hc/en-us/articles/360039616411'));
            }
        }
        dispatch(setIsLoadingAction(false));
        dispatch(setIsLedgerConnectingAction(false));
    };
}
