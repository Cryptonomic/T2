import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Close from '@material-ui/icons/Close';

import { SettingsContext } from './Settings-context';
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

const SettingsContainer = () => {
  const props: any = useContext(SettingsContext);
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

  const onRemovePath = (event, label) => {
    event.stopPropagation();
    const list = pathsList.filter(item => item.label !== label);
    let selected = selectedPath;
    if (label === selectedPath) {
      selected = pathsList[pathsList.length - 1].label;
      setIsPathChanged(true);
    }
    removePath(list, selected);
  };

  const onRemoveNode = (event, name) => {
    event.stopPropagation();
    const list = nodesList.filter(item => item.displayName !== name);
    let selected = selectedNode;
    if (name === selectedNode) {
      selected = nodesList[nodesList.length - 1].displayName;
      setIsPathChanged(true);
    }
    removeNode(list, selected);
  };

  const onAddNode = (node: Node) => {
    const selected = node.displayName;
    const list = [...nodesList, node];
    setIsPathChanged(true);
    addNode(list, selected);
  };

  const onAddPath = (path: Path) => {
    const selected = path.label;
    const list = [...pathsList, path];
    setIsPathChanged(true);
    addPath(list, selected);
  };

  const onClickBackButton = () => history.goBack();

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
