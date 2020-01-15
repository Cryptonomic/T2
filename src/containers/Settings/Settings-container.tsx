import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Close from '@material-ui/icons/Close';

import SettingsView from './Settings-view';

import { getMainPath } from '../../utils/settings';

import {
  OptionLabel,
  NodeName,
  NodeUrl,
  ItemWrapper,
  RemoveIconBtn,
  CheckIcon,
  SelectRenderWrapper,
  NodeUrlSpan
} from './Settings-styles';

import { Node, Path } from '../../types/general';
import { Props } from './Settings-types';

const SettingsContainer = (props: Props) => {
  const history = useHistory();
  const {
    t,
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

  const onRemovePath = (event, label) => {
    event.stopPropagation();
    if (label === selectedPath) {
      setIsPathChanged(true);
    }
    removePath(label);
  };

  const onRemoveNode = (event, name) => {
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

  const onClickBackButton = () => {
    history.goBack();
    // if (isPathChanged) {
    //   // goHomeAndClearState();
    // } else {
    //   // goBack();
    //   // syncWallet();
    // }
  };

  const onChangeCustomSelectNodes = event => {
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

  const onChangeCustomSelectDerivationPath = event => {
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

  const renderCustomSelectDerivationPath = value => {
    const path = getMainPath(pathsList, selectedPath);
    return (
      <SelectRenderWrapper>
        <span>{value} </span>
        <NodeUrlSpan>({path})</NodeUrlSpan>
      </SelectRenderWrapper>
    );
  };

  const renderCustomSelectNodesValue = value => {
    return (
      <SelectRenderWrapper>
        <span>{value}</span>
      </SelectRenderWrapper>
    );
  };

  const renderNodes = () => {
    return nodesList.map((node, index) => {
      const isSelected = selectedNode === node.displayName;
      return (
        <ItemWrapper key={index} value={node.displayName}>
          {isSelected && <CheckIcon />}
          <OptionLabel isActive={isSelected}>
            <NodeName>{node.displayName}</NodeName>
          </OptionLabel>
          {index > 0 && (
            <RemoveIconBtn onClick={event => onRemoveNode(event, name)}>
              <Close />
            </RemoveIconBtn>
          )}
        </ItemWrapper>
      );
    });
  };

  const renderPaths = () => {
    return pathsList.map((path, index) => {
      const isSelected = selectedPath === path.label;
      return (
        <ItemWrapper key={index} value={path.label}>
          {isSelected && <CheckIcon />}
          <OptionLabel isActive={isSelected}>
            <NodeName>{path.label}</NodeName>
            <NodeUrl>{path.derivation}</NodeUrl>{' '}
          </OptionLabel>
          {path.label !== 'Default' && (
            <RemoveIconBtn aria-label="delete" onClick={event => onRemovePath(event, path.label)}>
              <Close />
            </RemoveIconBtn>
          )}
        </ItemWrapper>
      );
    });
  };

  const backTitle = isPathChanged
    ? t('containers.homeSettings.back_to_login')
    : t('containers.homeSettings.back_to_wallet');

  const toProps = {
    t,
    backTitle,
    locale,
    changeLocale,
    selectedNode,
    selectedPath,
    isNodeModalOpen,
    isPathModalOpen,
    setIsNodeModalOpen,
    setIsPathModalOpen,
    onAddPath,
    onAddNode,
    onClickBackButton,
    onChangeCustomSelectNodes,
    onChangeCustomSelectDerivationPath,
    renderCustomSelectDerivationPath,
    renderCustomSelectNodesValue,
    renderNodes,
    renderPaths
  };

  return <SettingsView {...toProps} />;
};

export default SettingsContainer;
