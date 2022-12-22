import { Storage, StorageKey, StorageKeyReturnType, defaultValues } from '@airgap/beacon-types';

/**
 * @internalapi
 *
 * A storage that can be used in chrome extensions
 */
export class ChromeStorage implements Storage {
    public static async isSupported(): Promise<boolean> {
        return typeof window !== 'undefined' && typeof chrome !== 'undefined' && Boolean(chrome) && Boolean(chrome.runtime) && Boolean(chrome.runtime.id);
    }

    // eslint-disable-next-line class-methods-use-this
    public async get<K extends StorageKey>(key: K): Promise<StorageKeyReturnType[K]> {
        return new Promise((resolve) => {
            chrome.storage.local.get(null, (storageContent) => {
                if (storageContent[key]) {
                    resolve(storageContent[key]);
                } else if (typeof defaultValues[key] === 'object') {
                    resolve(JSON.parse(JSON.stringify(defaultValues[key])));
                } else {
                    resolve(defaultValues[key]);
                }
            });
        });
    }

    // eslint-disable-next-line class-methods-use-this
    public async set<K extends StorageKey>(key: K, value: StorageKeyReturnType[K]): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: value }, () => {
                resolve();
            });
        });
    }

    // eslint-disable-next-line class-methods-use-this
    public async delete<K extends StorageKey>(key: K): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: undefined }, () => {
                resolve();
            });
        });
    }
}
