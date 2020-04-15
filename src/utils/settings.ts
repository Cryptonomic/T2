import { getLocalData, resetLocalData } from '../utils/localData';
import { Node, Path } from '../types/general';

const defaultSettings = {
  locale: 'en-US',
  selectedNode: '',
  nodesList: [],
  selectedPath: '',
  pathsList: []
};

export function getWalletSettings() {
  const localSettings = getLocalData('settings');
  if (
    (!!localSettings.selectedNode && localSettings.nodesList.length === 0) ||
    (!!localSettings.selectedPath && localSettings.pathsList.length === 0)
  ) {
    resetLocalData('settings');
    return getInitWalletSettings();
  } else {
    return localSettings;
  }
}

export function getInitWalletSettings() {
  try {
    const fileSettings = require('../extraResources/walletSettings.json');
    return { ...defaultSettings, ...fileSettings };
  } catch (err) {
    console.error('load setting error', err);
    return defaultSettings;
  }
}

export function getSavedLocale(): string {
  return getLocalData('settings.locale');
}

export function getMainNode(nodes: Node[], name: string): Node {
  const selectedNode = nodes.find(node => node.displayName === name) || nodes[0];
  return selectedNode;
}

export function getMainPath(pathsList: Path[], selectedPath: string): string {
  let path = '';
  const foundPath = pathsList.find(item => item.label === selectedPath);
  if (foundPath) {
    path = foundPath.derivation;
  }
  return path;
}
