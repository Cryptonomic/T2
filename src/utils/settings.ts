import { getLocalData } from '../utils/localData';
import { Node } from '../types/general';

export function getWalletSettings() {
  const localSettings = getLocalData('settings');
  if (localSettings.selectedNode) {
    return localSettings;
  }
  try {
    const fileSettings = require('../extraResources/walletSettings.json');
    return fileSettings;
  } catch (err) {
    console.error('load setting error', err);
    return localSettings;
  }
}

export function getSavedLocale(): string {
  return getLocalData('settings.locale');
}

export function getMainNode(nodes: Node[], name: string): Node {
  const selectedNode = nodes.find(node => node.displayName === name) || nodes[0];
  return selectedNode;
}
