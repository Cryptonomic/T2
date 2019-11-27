import { getLocalData, setLocalData, removeLocalData } from '../utils/localData';

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
