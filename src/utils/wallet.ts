import * as fs from 'fs';
import path from 'path';
import { KeyStore, KeyStoreType, TezosMessageUtils, Signer } from 'conseiljs';
import { CryptoUtils, SoftSigner } from 'conseiljs-softsigner';
import { KeyStoreUtils } from 'conseiljs-ledgersigner';
import { omit, cloneDeep } from 'lodash';

import { getLocalData, setLocalData } from './localData';
import { createIdentity } from './identity';
import { combineAccounts } from './account';
import { EncryptedWalletVersionOne, Wallet } from '../types/general';
import { Identity } from '../types/general';
import { knownTokenContracts } from '../constants/Token';

const { unlockAddress } = KeyStoreUtils;

export async function saveUpdatedWallet(identities, walletLocation, walletFileName, password) {
    const completeWalletPath = path.join(walletLocation, walletFileName);
    return await saveWallet(completeWalletPath, { identities }, password);
}

export async function cloneDecryptedSigner(signer: SoftSigner, password: string): Promise<Signer> {
    return SoftSigner.createSigner(await signer.getKey(password));
}

export function saveIdentitiesToLocal(identities: Identity[]) {
    let newIdentities = cloneDeep(identities);
    newIdentities = newIdentities.map((identity) => {
        identity = omit(identity, ['publicKey', 'privateKey', 'secretKey', 'activeTab']); // WARNING: do not save secret key to local storage
        identity.accounts = identity.accounts.map((account) => {
            account = omit(account, ['activeTab']);
            return account;
        });
        return identity;
    });

    setLocalData('identities', newIdentities);
}

function prepareToLoad(serverIdentities, localIdentities): Identity[] {
    // TODO: types
    return serverIdentities.map((identity, index) => {
        const foundIdentity = localIdentities.find((localIdentity) => identity.publicKeyHash === localIdentity.publicKeyHash);
        let newAccounts = identity.accounts || [];
        if (foundIdentity) {
            newAccounts = combineAccounts(newAccounts, foundIdentity.accounts);
        }
        return createIdentity({ ...identity, accounts: newAccounts, order: index + 1 });
    });
}

export async function loadPersistedState(walletPath: string, password: string): Promise<Identity[]> {
    const { identities } = await loadWallet(walletPath, password).catch((err) => {
        const errorObj = {
            name: 'components.messageBar.messages.invalid_wallet_password',
            ...err,
        };
        console.error(errorObj);
        throw errorObj;
    });

    const localIdentities = getLocalData('identities');
    return prepareToLoad(identities, localIdentities);
}

export async function loadWalletFromLedger(derivationPath: string): Promise<Identity[]> {
    const identity = await unlockAddress(derivationPath).catch((err) => {
        const errorObj = {
            name: 'components.messageBar.messages.ledger_not_connect',
        };
        console.error('TezosLedgerWallet.unlockAddress', err);
        throw errorObj;
    });

    identity.storeType = KeyStoreType.Hardware;
    identity.derivationPath = derivationPath;
    const identities = [identity];
    const localIdentities = getLocalData('identities');
    return prepareToLoad(identities, localIdentities);
}

export function loadTokens(network: string) {
    return knownTokenContracts.filter((token) => token.network === network);
}

/**
 * Saves a wallet to a given file.
 *
 * @param {string} filename Path to file
 * @param {Wallet} wallet Wallet object
 * @param {string} passphrase User-supplied passphrase
 * @returns {Promise<Wallet>} Wallet object loaded from disk
 */
export async function saveWallet(filename: string, wallet: Wallet, passphrase: string): Promise<Wallet> {
    const keys = Buffer.from(JSON.stringify(wallet.identities), 'utf8');
    const salt = await CryptoUtils.generateSaltForPwHash();
    const encryptedKeys = await CryptoUtils.encryptMessage(keys, passphrase, salt);

    const encryptedWallet: EncryptedWalletVersionOne = {
        version: '1',
        salt: TezosMessageUtils.readBufferWithHint(salt, ''),
        ciphertext: TezosMessageUtils.readBufferWithHint(encryptedKeys, ''),
        kdf: 'Argon2',
    };

    const p = new Promise((resolve, reject) => {
        fs.writeFile(filename, JSON.stringify(encryptedWallet), { mode: 0o600 }, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(undefined);
        });
    });
    await p;
    return loadWallet(filename, passphrase);
}

/**
 * Loads a wallet from a given file.
 *
 * @param {string} filename Name of file
 * @param {string} passphrase User-supplied passphrase
 * @returns {Promise<Wallet>} Loaded wallet
 */
export async function loadWallet(filename: string, passphrase: string): Promise<Wallet> {
    const p = new Promise<EncryptedWalletVersionOne>((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            const encryptedWallet: EncryptedWalletVersionOne = JSON.parse(data.toString()) as EncryptedWalletVersionOne;
            resolve(encryptedWallet);
        });
    });

    const ew = await p;
    const encryptedKeys = TezosMessageUtils.writeBufferWithHint(ew.ciphertext);
    const salt = TezosMessageUtils.writeBufferWithHint(ew.salt);

    const walletData: any[] = JSON.parse((await CryptoUtils.decryptMessage(encryptedKeys, passphrase, salt)).toString());
    const keys: KeyStore[] = [];

    walletData.forEach((w) => {
        const pk = w.privateKey;
        delete w.privateKey; // TODO: pre v100 wallet data
        keys.push({
            ...w,
            secretKey: w.secretKey || pk,
        });
    });

    return { identities: keys };
}

/**
 * Creates a new wallet file.
 * @param {string} filename Where to save the wallet file
 * @param {string} password User-supplied passphrase used to secure wallet file
 * @returns {Promise<Wallet>} Object corresponding to newly-created wallet
 */
export async function createWallet(filename: string, password: string): Promise<any> {
    const wallet: Wallet = { identities: [] };
    await saveWallet(filename, wallet, password);

    return wallet;
}
