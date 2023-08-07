import { Storage } from '@airgap/beacon-types';
import { Logger } from '../utils/Logger';
import { ChromeStorage, LocalStorage } from '..';

const logger = new Logger('STORAGE');

/**
 * Get a supported storage on this platform
 */
export const getStorage: () => Promise<Storage> = async (): Promise<Storage> => {
    if (await ChromeStorage.isSupported()) {
        logger.log('getStorage', 'USING CHROME STORAGE');

        return new ChromeStorage();
    }
    if (await LocalStorage.isSupported()) {
        logger.log('getStorage', 'USING LOCAL STORAGE');

        return new LocalStorage();
    }
    throw new Error('no storage type supported');
};
