import { createSelector } from 'reselect';
import { getMainNode } from '../../utils/settings';
import { RootState } from '../../types/store';
import { Node } from '../../types/general';

const selectedNodeSelector = (state: RootState) => state.settings.selectedNode;
const nodeListSelector = (state: RootState) => state.settings.nodesList;

export const getSelectedNode = createSelector(
  selectedNodeSelector,
  nodeListSelector,
  (selectedNode, nodesList): Node => getMainNode(nodesList, selectedNode)
);
