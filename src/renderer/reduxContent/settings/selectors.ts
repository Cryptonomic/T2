import { createSelector } from 'reselect';
import { getMainNode, getMainPath } from '../../utils/settings';
import { RootState } from '../../types/store';
import { Node } from '../../types/general';

const selectedNodeSelector = (state: RootState) => state.settings.selectedNode;
const nodeListSelector = (state: RootState) => state.settings.nodesList;
const selectedPathSelector = (state: RootState) => state.settings.selectedPath;
const pathListSelector = (state: RootState) => state.settings.pathsList;

export const getSelectedNode = createSelector(
  selectedNodeSelector,
  nodeListSelector,
  (selectedNode, nodesList): Node => getMainNode(nodesList, selectedNode)
);

export const getIsNodesSelector = createSelector(
  nodeListSelector,
  (nodesList): boolean => nodesList.length > 0
);

export const getSelectedPath = createSelector(
  selectedPathSelector,
  pathListSelector,
  (selectedPath, pathsList): string => getMainPath(pathsList, selectedPath)
);
