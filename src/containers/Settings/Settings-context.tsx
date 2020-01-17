import React, { createContext, useState } from 'react';

import { setLocalData } from '../../utils/localData';
import { getWalletSettings } from '../../utils/settings';

const baseState: any = {
  locale: 'en-US',
  selectedNode: '',
  nodesList: [],
  selectedPath: '',
  pathsList: []
};
const walletSettings = getWalletSettings();
const initialState = { ...baseState, ...walletSettings };

export const SettingsContext = createContext({});
SettingsContext.displayName = 'SettingsContext';

export default props => {
  const [settings, setSettings] = useState(initialState);

  const changeLocale = (locale: string) => {
    setSettings({ ...settings, locale });
    setLocalData('settings.locale', locale);
  };

  const changePath = (selectedPath: string) => {
    setSettings({ ...settings, selectedPath });
    setLocalData('settings.selectedPath', selectedPath);
  };

  const changeNode = (selectedNode: string) => {
    setSettings({ ...settings, selectedNode });
    setLocalData('settings.selectedNode', selectedNode);
  };

  const removePath = (pathsList, selectedPath) => {
    setSettings({ ...settings, pathsList, selectedPath });
    setLocalData('settings.pathsList', pathsList);
    setLocalData('settings.selectedPath', selectedPath);
  };

  const removeNode = (nodesList, selectedNode) => {
    setSettings({ ...settings, nodesList, selectedNode });
    setLocalData('settings.nodesList', nodesList);
    setLocalData('settings.selectedNode', selectedNode);
  };

  const addNode = (nodesList, selectedNode) => {
    setSettings({ ...settings, nodesList, selectedNode });
    setLocalData('settings.nodesList', nodesList);
    setLocalData('settings.selectedNode', selectedNode);
  };

  const addPath = (pathsList, selectedPath) => {
    setSettings({ ...settings, pathsList, selectedPath });
    setLocalData('settings.pathsList', pathsList);
    setLocalData('settings.selectedPath', selectedPath);
  };

  const actions = {
    changeLocale,
    changePath,
    changeNode,
    removePath,
    removeNode,
    addNode,
    addPath
  };

  const value = {
    ...settings,
    ...actions
  };

  return <SettingsContext.Provider value={value}>{props.children}</SettingsContext.Provider>;
};
