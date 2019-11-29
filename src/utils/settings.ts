import { getLocalData } from '../utils/localData';
import { Node } from '../types/general';

export function getWalletSettings() {
  const localSettings = getLocalData('settings');
  try {
    const fileSettings = require('../extraResources/walletSettings.json');
    return { ...fileSettings, ...localSettings };
  } catch (err) {
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
