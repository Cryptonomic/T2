import { getLocalData, resetLocalData } from './localData';
import { Node, Path, SettingsType } from '../types/general';

export const defaultSettings: SettingsType = {
    locale: 'en-US',
    selectedNode: '',
    nodesList: [],
    selectedPath: '',
    pathsList: [],
};

export function getInitWalletSettings() {
    try {
        const fileSettings = require('../extraResources/walletSettings.json');
        return { ...defaultSettings, ...fileSettings };
    } catch (err) {
        console.error('load setting error', err);
        return defaultSettings;
    }
}

export function getWalletSettings() {
    const localSettings = getLocalData('settings');

    if ((!localSettings.selectedNode && localSettings.nodesList.length === 0) || (!localSettings.selectedPath && localSettings.pathsList.length === 0)) {
        resetLocalData('settings');
        return getInitWalletSettings();
    }
    return localSettings;
}

export function getSavedLocale(): string {
    return getLocalData('settings.locale');
}

export function getMainNode(nodes: Node[], name: string): Node {
    const selectedNode = nodes.find((node) => node.displayName === name) || nodes[0];
    return selectedNode;
}

export function getMainPath(pathsList: Path[], selectedPath: string): string {
    let path = '';
    const foundPath = pathsList.find((item) => item.label === selectedPath);
    if (foundPath) {
        path = foundPath.derivation;
    }
    return path;
}
