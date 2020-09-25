import { getInitWalletSettings } from './settings';
const Store = require('electron-store');
const schema = {
    settings: {
        locale: {
            type: 'string',
            default: 'en-US',
        },
        selectedNode: {
            type: 'string',
            default: '',
        },
        nodesList: {
            type: 'array',
            default: [],
        },
        selectedPath: {
            type: 'string',
            default: '',
        },
        pathsList: {
            type: 'array',
            default: [],
        },
    },
    identities: {
        type: 'array',
        default: [],
    },
    isPPAccepted: {
        type: 'boolean',
        default: false,
    },
    isShowedInitScene: {
        type: 'boolean',
        default: false,
    },
    isNotShowMessage: {
        type: 'boolean',
        default: false,
    },
    isHideDelegateTooltip: {
        type: 'boolean',
        default: false,
    },
    tokens: {
        type: 'array',
        default: [],
    },
};

const defaultSettings = getInitWalletSettings();

const defaultStore = {
    settings: defaultSettings,
    identities: [],
    isPPAccepted: false,
    isShowedInitScene: false,
    isNotShowMessage: false,
    isHideDelegateTooltip: false,
    tokens: [],
};

const store = new Store({ schema, defaults: defaultStore });

// Set data in store
export function setLocalData(key: string, data: any) {
    store.set(key, data);
}

// Get data in store
export function getLocalData(key: string) {
    return store.get(key);
}

// Remove data in store
export function removeLocalData(key: string) {
    store.delete(key);
}

// reset data in store
export function resetLocalData(key: string) {
    store.set(key, defaultStore[key]);
}

export function resetAllLocalData() {
    store.set(defaultStore);
}
