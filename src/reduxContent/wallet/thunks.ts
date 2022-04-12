import path from 'path';
import { ipcRenderer } from 'electron';
import { push } from 'react-router-redux';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import {
    TezosNodeWriter,
    KeyStoreType,
    Tzip7ReferenceTokenHelper,
    MultiAssetTokenHelper,
    SingleAssetTokenHelper,
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

import * as token2Util from '../../contracts/Token2Contract/util';

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

import { clearNFTCollectionsAction, endNFTSyncAction } from '../nft/actions';

import { setSignerThunk, setLedgerSignerThunk } from '../app/thunks';
import { syncNFTThunk } from '../nft/thunks';

import { getMainNode, getMainPath } from '../../utils/settings';
import { createWallet } from '../../utils/wallet';
import { ACTIVATION } from '../../constants/TransactionTypes';
import { Identity, Token, AddressType } from '../../types/general';

import * as NFTUtil from '../../contracts/NFT/util';
import * as tzbtcUtil from '../../contracts/TzBtcToken/util';
import * as tzip7Util from '../../contracts/TokenContract/util';
import * as tzip12Util from '../../contracts/Token2Contract/util';
import * as wxtzUtil from '../../contracts/WrappedTezos/util';
import * as plentyUtil from '../../contracts/Plenty/util';
import { JSONPath } from 'jsonpath-plus';
import { getLocalData } from '../../utils/localData';

const { restoreIdentityFromFundraiser, restoreIdentityFromMnemonic, restoreIdentityFromSecretKey } = KeyStoreUtils;

const { sendIdentityActivationOperation } = TezosNodeWriter;
let currentAccountRefreshInterval: any = null;

export function goHomeAndClearState() {
    return (dispatch) => {
        dispatch(logoutAction());
        dispatch(clearNFTCollectionsAction());
        dispatch(endNFTSyncAction(new Date(0)));
        clearAutomaticAccountRefresh();
        dispatch(push('/'));
    };
}

export function automaticAccountRefresh() {
    return (dispatch) => {
        if (currentAccountRefreshInterval) {
            clearAutomaticAccountRefresh();
        }

        currentAccountRefreshInterval = setInterval(() => {
            // Sync the wallet:
            dispatch(syncWalletThunk()).then(() => {
                // When wallet sync is done, try to sync NFT collections and tokens.
                // The 'syncNFTThunk' not necessary runs anything, ie. it won't do anything
                // if 'syncEnabled' flag is set to true in the NFT store.
                // NFT sync is also very expensive so it's run less frequently than wallet sync.
                dispatch(syncNFTThunk());
            });
        }, 60_000);
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
        const { selectedAccountHash, selectedParentHash, selectedTokenName } = state().app;
        if (isToken) {
            const { tokens } = state().wallet;
            const tokenIndex = findTokenIndex(tokens, selectedAccountHash, selectedTokenName);
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
                balanceAsync = Tzip7ReferenceTokenHelper.getAccountBalance(mainNode.tezosUrl, mapid, selectedParentHash, tokens[tokenIndex].balancePath);
                detailsAsync = Tzip7ReferenceTokenHelper.getSimpleStorage(mainNode.tezosUrl, tokens[tokenIndex].address).then(async (d) => {
                    const keyCount = await TezosConseilClient.countKeysInMap(serverInfo, mapid);
                    if (tokens[tokenIndex].address === 'KT1JkoE42rrMBP9b2oDhbx6EUr26GcySZMUH') {
                        // TODO
                        return { ...d, holders: keyCount, supply: 1000000000000000000000000 };
                    }

                    if (tokens[tokenIndex].address === 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4') {
                        const storage = await TezosNodeReader.getContractStorage(mainNode.tezosUrl, tokens[tokenIndex].address);
                        return { ...d, holders: keyCount, supply: Number(JSONPath({ path: '$.args[3].int', json: JSON.parse(storage) })[0]) };
                    }

                    return { ...d, holders: keyCount };
                });
                transAsync = []; // tzip7Util.syncTokenTransactions(
                //     tokenAddress,
                //     selectedParentHash,
                //     mainNode,
                //     tokens[tokenIndex].transactions,
                //     tokens[tokenIndex].kind
                // );
            } else if (tokens[tokenIndex].kind === TokenKind.tzbtc) {
                balanceAsync = TzbtcTokenHelper.getAccountBalance(mainNode.tezosUrl, mapid, selectedParentHash);
                transAsync = tzbtcUtil.syncTokenTransactions(tokenAddress, selectedParentHash, mainNode, tokens[tokenIndex].transactions);
                detailsAsync = TzbtcTokenHelper.getTokenSupply(mainNode.tezosUrl).then(async (supply) => {
                    const paused = await TzbtcTokenHelper.getPaused(mainNode.tezosUrl);
                    const keyCount = (await TezosConseilClient.countKeysInMap(serverInfo, mapid)) - 3; // paused, totalSupply, operators

                    return { supply, paused, holders: keyCount };
                });
            } else if (tokens[tokenIndex].kind === TokenKind.wxtz) {
                const vaultToken = tokens[tokenIndex] as VaultToken;
                const coreContractAddress = vaultToken.vaultCoreAddress;
                const vaultListBigMapId = vaultToken.vaultRegistryMapId;

                balanceAsync = WrappedTezosHelper.getAccountBalance(mainNode.tezosUrl, mapid, selectedParentHash);
                transAsync = [];
                // tzbtcUtil.syncTokenTransactions(tokenAddress, selectedParentHash, mainNode, tokens[tokenIndex].transactions);
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
                transAsync = []; // tzip7Util.syncTokenTransactions(
                //     tokenAddress,
                //     selectedParentHash,
                //     mainNode,
                //     tokens[tokenIndex].transactions,
                //     tokens[tokenIndex].kind
                // );
            } else if (tokens[tokenIndex].kind === TokenKind.blnd) {
                balanceAsync = WrappedTezosHelper.getAccountBalance(mainNode.tezosUrl, mapid, selectedParentHash);
                detailsAsync = WrappedTezosHelper.getSimpleStorage(mainNode.tezosUrl, tokens[tokenIndex].address).then(async (d) => {
                    const keyCount = await TezosConseilClient.countKeysInMap(serverInfo, mapid);

                    return { ...d, holders: keyCount };
                });
                transAsync = []; // tzip7Util.syncTokenTransactions(
                //     tokenAddress,
                //     selectedParentHash,
                //     mainNode,
                //     tokens[tokenIndex].transactions,
                //     tokens[tokenIndex].kind
                // );
            } else if (tokens[tokenIndex].kind === TokenKind.stkr) {
                balanceAsync = WrappedTezosHelper.getAccountBalance(mainNode.tezosUrl, mapid, selectedParentHash);
                detailsAsync = WrappedTezosHelper.getSimpleStorage(mainNode.tezosUrl, tokens[tokenIndex].address).then(async (d) => {
                    const keyCount = await TezosConseilClient.countKeysInMap(serverInfo, mapid);

                    return { ...d, holders: keyCount };
                });
                transAsync = []; // tzip7Util.syncTokenTransactions(
                //     tokenAddress,
                //     selectedParentHash,
                //     mainNode,
                //     tokens[tokenIndex].transactions,
                //     tokens[tokenIndex].kind
                // );
            } else if (tokens[tokenIndex].kind === TokenKind.plenty) {
                balanceAsync = plentyUtil.getAccountBalance(mainNode.tezosUrl, mapid, selectedParentHash);
                detailsAsync = plentyUtil.getSimpleStorage(mainNode.tezosUrl, tokens[tokenIndex].address).then(async (d) => {
                    const keyCount = await TezosConseilClient.countKeysInMap(serverInfo, mapid);

                    return { ...d, holders: keyCount };
                });
                transAsync = []; // tzip7Util.syncTokenTransactions(
                //     tokenAddress,
                //     selectedParentHash,
                //     mainNode,
                //     tokens[tokenIndex].transactions,
                //     tokens[tokenIndex].kind
                // );
            } else if (tokens[tokenIndex].kind === TokenKind.tzip12) {
                if (tokens[tokenIndex].tokenIndex !== undefined) {
                    balanceAsync = MultiAssetTokenHelper.getAccountBalance(
                        mainNode.tezosUrl,
                        mapid,
                        selectedParentHash,
                        tokens[tokenIndex].tokenIndex || 0,
                        tokens[tokenIndex].balancePath
                    );
                } else {
                    balanceAsync = SingleAssetTokenHelper.getAccountBalance(mainNode.tezosUrl, mapid, selectedParentHash, tokens[tokenIndex].balancePath);
                }

                if (tokens[tokenIndex].symbol.toLowerCase() === 'btctz' || tokens[tokenIndex].symbol.toLowerCase() === 'oldbtctz') {
                    // TODO
                    detailsAsync = token2Util
                        .getSimpleStorageYV(mainNode.tezosUrl, tokens[tokenIndex].address, selectedParentHash)
                        .then(async (d) => {
                            const keyCount = await TezosConseilClient.countKeysInMap(serverInfo, mapid);

                            return { ...d, holders: keyCount };
                        })
                        .catch(() => undefined);
                } else {
                    detailsAsync = MultiAssetTokenHelper.getSimpleStorage(mainNode.tezosUrl, tokens[tokenIndex].address)
                        .then(async (d) => {
                            const keyCount = await TezosConseilClient.countKeysInMap(serverInfo, mapid);

                            return { ...d, holders: keyCount };
                        })
                        .catch(() => undefined); // supply, paused
                }

                transAsync = []; // tzip12Util.syncTokenTransactions(
                //     tokenAddress,
                //     selectedParentHash,
                //     mainNode,
                //     tokens[tokenIndex].transactions,
                //     tokens[tokenIndex].kind
                // );
            }

            try {
                const [balance, transactions, details] = await Promise.all([balanceAsync, transAsync, detailsAsync]);

                let administrator = tokens[tokenIndex].administrator;
                administrator = details?.administrator || '';

                tokens[tokenIndex] = { ...tokens[tokenIndex], administrator, balance, transactions, details };
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
                const serverInfo: ConseilServerInfo = { url: mainNode.conseilUrl, apiKey: mainNode.apiKey, network: mainNode.network };

                if (token.kind === TokenKind.tzip7 || token.kind === TokenKind.usdtz || token.kind === TokenKind.ethtz) {
                    const mapid = token.mapid || -1;
                    let administrator = token.administrator;

                    let details: any = await Tzip7ReferenceTokenHelper.getSimpleStorage(mainNode.tezosUrl, token.address).catch(() => undefined);
                    administrator = details?.administrator || '';
                    const keyCount = await TezosConseilClient.countKeysInMap(serverInfo, token.mapid);
                    details = { ...details, holders: keyCount };

                    const balance = await Tzip7ReferenceTokenHelper.getAccountBalance(mainNode.tezosUrl, mapid, selectedParentHash, token.balancePath).catch(
                        () => 0
                    );

                    if (token.address === 'KT1JkoE42rrMBP9b2oDhbx6EUr26GcySZMUH' && details) {
                        // TODO
                        details.supply = 1000000000000000000000000;
                    }

                    if (token.address === 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4' && details) {
                        const storage = await TezosNodeReader.getContractStorage(mainNode.tezosUrl, token.address);
                        details.supply = Number(JSONPath({ path: '$.args[3].int', json: storage })[0]);
                    }

                    const transactions = [];
                    // await tzip7Util.syncTokenTransactions(token.address, selectedParentHash, mainNode, token.transactions, token.kind);
                    return { ...token, administrator, balance, transactions, details };
                } else if (token.kind === TokenKind.tzbtc) {
                    const administrator = token.administrator || '';

                    const balance = await TzbtcTokenHelper.getAccountBalance(mainNode.tezosUrl, token.mapid, selectedParentHash).catch(() => 0);
                    const transactions = [];
                    // await tzbtcUtil.syncTokenTransactions(token.address, selectedParentHash, mainNode, token.transactions); /* TODO */

                    return { ...token, administrator, balance, transactions };
                } else if (token.kind === TokenKind.wxtz) {
                    const vaultToken = token as VaultToken;

                    const balance = await WrappedTezosHelper.getAccountBalance(mainNode.tezosUrl, token.mapid, selectedParentHash).catch(() => 0);
                    const transactions = [];
                    // await wxtzUtil.syncTokenTransactions(token.address, selectedParentHash, mainNode, token.transactions);

                    const coreContractAddress = vaultToken.vaultCoreAddress;

                    const vaultListBigMapId = vaultToken.vaultRegistryMapId;

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

                    return { ...token, administrator: '', balance, transactions, vaultList };
                } else if (token.kind === TokenKind.kusd) {
                    const administrator = token.administrator;
                    let details: any = await KolibriTokenHelper.getSimpleStorage(mainNode.tezosUrl, token.address).catch(() => undefined);
                    const keyCount = await TezosConseilClient.countKeysInMap(serverInfo, token.mapid);
                    details = { ...details, holders: keyCount };

                    const balance = await KolibriTokenHelper.getAccountBalance(mainNode.tezosUrl, token.mapid, selectedParentHash).catch(() => 0);
                    const transactions = [];
                    // await tzip7Util.syncTokenTransactions(token.address, selectedParentHash, mainNode, token.transactions, token.kind);

                    return { ...token, administrator, balance, transactions, details };
                } else if (token.kind === TokenKind.objkt) {
                    const artToken = token as ArtToken;

                    return { ...artToken, administrator: '', balance: 0, transactions: [] };
                } else if (token.kind === TokenKind.stkr || token.kind === TokenKind.blnd) {
                    let administrator = token.administrator;

                    let details: any = await WrappedTezosHelper.getSimpleStorage(mainNode.tezosUrl, token.address).catch((e) => {
                        return undefined;
                    });
                    administrator = details?.administrator || '';

                    const keyCount = await TezosConseilClient.countKeysInMap(serverInfo, token.mapid);
                    details = { ...details, holders: keyCount };

                    const balance = await WrappedTezosHelper.getAccountBalance(mainNode.tezosUrl, token.mapid, selectedParentHash).catch(() => 0);
                    const transactions = []; // await tzip7Util.syncTokenTransactions(
                    //     token.address,
                    //     selectedParentHash,
                    //     mainNode,
                    //     token.transactions,
                    //     token.kind
                    // ); /* TODO */

                    return { ...token, administrator, balance, transactions, details };
                } else if (token.kind === TokenKind.plenty) {
                    let administrator = token.administrator;

                    let details: any = await plentyUtil.getSimpleStorage(mainNode.tezosUrl, token.address).catch(() => undefined);
                    administrator = details?.administrator || '';

                    const keyCount = await TezosConseilClient.countKeysInMap(serverInfo, token.mapid);
                    details = { ...details, holders: keyCount };

                    const balance = await Tzip7ReferenceTokenHelper.getAccountBalance(
                        mainNode.tezosUrl,
                        token.mapid,
                        selectedParentHash,
                        token.balancePath
                    ).catch(() => 0);
                    const transactions = [];
                    // await tzip7Util.syncTokenTransactions(token.address, selectedParentHash, mainNode, token.transactions, token.kind);

                    return { ...token, administrator, balance, transactions, details };
                } else if (token.kind === TokenKind.tzip12) {
                    let administrator = token.administrator;

                    let details: any = {};
                    if (token.symbol.toLowerCase() === 'btctz' || token.symbol.toLowerCase() === 'oldbtctz') {
                        // TODO
                        details = await token2Util.getSimpleStorageYV(mainNode.tezosUrl, token.address, selectedParentHash).catch(() => undefined);
                    } else {
                        details = await MultiAssetTokenHelper.getSimpleStorage(mainNode.tezosUrl, token.address).catch(() => undefined); // supply, paused
                    }

                    administrator = details?.administrator || '';

                    const keyCount = await TezosConseilClient.countKeysInMap(serverInfo, token.mapid);
                    details = { ...details, holders: keyCount };

                    let balance = 0;
                    if (token.tokenIndex !== undefined) {
                        balance = await MultiAssetTokenHelper.getAccountBalance(
                            mainNode.tezosUrl,
                            token.mapid,
                            selectedParentHash,
                            token.tokenIndex || 0,
                            token.balancePath
                        ).catch(() => 0);
                    } else {
                        balance = await SingleAssetTokenHelper.getAccountBalance(mainNode.tezosUrl, token.mapid, selectedParentHash, token.balancePath).catch(
                            () => 0
                        );
                    }

                    const transactions = []; // await tzip12Util.syncTokenTransactions(
                    //     token.address,
                    //     selectedParentHash,
                    //     mainNode,
                    //     token.transactions,
                    //     token.kind
                    // ); /* TODO */

                    return { ...token, administrator, balance, transactions, details };
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
        return;
    };
}

export function syncAccountOrIdentityThunk(selectedAccountHash, selectedParentHash, addressType) {
    return async (dispatch) => {
        try {
            dispatch(setWalletIsSyncingAction(true));
            if (
                addressType === AddressType.Token ||
                addressType === AddressType.Token2 ||
                addressType === AddressType.TzBTC ||
                addressType === AddressType.wXTZ ||
                addressType === AddressType.kUSD ||
                addressType === AddressType.BLND ||
                addressType === AddressType.STKR ||
                addressType === AddressType.plenty
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
        const builtinTokenAddresses = tokens.map((t) => t.address);
        const customTokens = getLocalData('token') || [];
        dispatch(updateTokensAction(tokens.concat(customTokens.filter((t) => !builtinTokenAddresses.includes(t.address)))));
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
                dispatch(createMessageAction(e.message, true));
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
