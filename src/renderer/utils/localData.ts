// import { getInitWalletSettings } from './settings';
import { Schema } from 'electron-store';

export type SchemaType = {
    settings: {
        locale: string;
        selectedNode: string;
        nodesList: any[];
        selectedPath: string;
        pathsList: any[];
    };
    identities: any[];
    isPPAccepted: boolean;
    isShowedInitScene: boolean;
    isNotShowMessage: boolean;
    isHideDelegateTooltip: boolean;
    tokens: any[];
};

export const schema: Schema<SchemaType> = {
    settings: {
        type: 'object',
        properties: {
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

// const defaultSettings = getInitWalletSettings();

const defaultSettings = {
    locale: 'en-US',
    selectedNode: '',
    nodesList: [],
    selectedPath: '',
    pathsList: [],
};

export const defaultStore = {
    settings: defaultSettings,
    identities: [],
    isPPAccepted: false,
    isShowedInitScene: false,
    isNotShowMessage: false,
    isHideDelegateTooltip: false,
    tokens: [],
};

// Set data in store
export function setLocalData(key: string, data: any) {
    window.electron.store.set(key, data);
}

// Get data in store
export function getLocalData(key: string) {
    return window.electron.store.get(key);
}

// Remove data in store
export function removeLocalData(key: string) {
    window.electron.store.delete(key);
}

// reset data in store
export function resetLocalData(key: string) {
    window.electron.store.set(key, defaultStore[key]);
}

export function resetAllLocalData() {
    window.electron.store.allset(defaultStore);
}
