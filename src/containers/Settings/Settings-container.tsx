import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import SettingsView from './Settings-view';

import { getMainPath } from '../../utils/settings';

import { Node, Path } from '../../types/general';
import { Props } from './Settings-types';

const SettingsContainer = (props: Props) => {
  const history = useHistory();
  const { t } = useTranslation();
  const {
    locale,
    changePath,
    removeNode,
    removePath,
    changeLocale,
    addNode,
    addPath,
    changeNode,
    pathsList,
    selectedNode,
    selectedPath,
    nodesList
  } = props;
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const [isPathModalOpen, setIsPathModalOpen] = useState(false);
  const [isPathChanged, setIsPathChanged] = useState(false);

  const onRemovePath = (event: React.MouseEvent, label: string) => {
    event.stopPropagation();
    if (label === selectedPath) {
      setIsPathChanged(true);
    }
    removePath(label);
  };

  const onRemoveNode = (event: React.MouseEvent, name: string) => {
    event.stopPropagation();
    if (name === selectedNode) {
      setIsPathChanged(true);
    }
    removeNode(name);
  };

  const onAddNode = (node: Node) => {
    setIsPathChanged(true);
    addNode(node);
  };

  const onAddPath = (path: Path) => {
    setIsPathChanged(true);
    addPath(path);
  };

  const onClickBackButton = () => history.goBack();

  const onChangeCustomSelectNodes = (event: React.ChangeEvent<{ value: string }>): boolean => {
    const newValue = event.target.value;
    if (newValue === 'add-more') {
      setIsNodeModalOpen(true);
      return true;
    }
    if (newValue !== selectedPath) {
      // todo syncwallet
      setIsPathChanged(true);
      changeNode(newValue);
      return true;
    }
    return true;
  };

  const onChangeCustomSelectDerivationPath = (
    event: React.ChangeEvent<{ value: string }>
  ): boolean => {
    const newValue = event.target.value;
    if (newValue === 'add-more') {
      setIsPathModalOpen(true);
      return true;
    }
    if (newValue !== selectedPath) {
      setIsPathChanged(true);
      changePath(newValue);
      return true;
    }
    return true;
  };

  const backTitle = isPathChanged
    ? t('containers.homeSettings.back_to_login')
    : t('containers.homeSettings.back_to_wallet');

  const pathName = getMainPath(pathsList, selectedPath);

  const toProps = {
    t,
    backTitle,
    locale,
    pathName,
    changeLocale,
    selectedNode,
    selectedPath,
    isNodeModalOpen,
    isPathModalOpen,
    setIsNodeModalOpen,
    setIsPathModalOpen,
    pathsList,
    nodesList,
    onRemovePath,
    onRemoveNode,
    onAddPath,
    onAddNode,
    onClickBackButton,
    onChangeCustomSelectNodes,
    onChangeCustomSelectDerivationPath
  };

  return <SettingsView {...toProps} />;
};

export default SettingsContainer;
