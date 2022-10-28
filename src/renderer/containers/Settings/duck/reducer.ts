import { getWalletSettings } from '../../../utils/settings';
import {
  CHANGE_LOCALE,
  CHANGE_NODE,
  ADD_NODE,
  REMOVE_NODE,
  CHANGE_PATH,
  ADD_PATH,
  REMOVE_PATH
} from './types';

import { SettingsActionTypes } from './types';
import { SettingsState } from '../../../types/store';

const walletSettings = getWalletSettings();

export function settingsReducer(
  state = walletSettings,
  action: SettingsActionTypes
): SettingsState {
  switch (action.type) {
    case CHANGE_LOCALE: {
      return { ...state, locale: action.locale };
    }
    case CHANGE_NODE: {
      return { ...state, selectedNode: action.name };
    }
    case ADD_NODE: {
      const selectedNode = action.node.displayName;
      return { ...state, selectedNode, nodesList: [...state.nodesList, action.node] };
    }
    case REMOVE_NODE: {
      const nodesList = state.nodesList.filter(item => item.displayName !== action.name);
      let selectedNode = '';
      if (action.name === state.selectedNode) {
        selectedNode = nodesList[nodesList.length - 1].displayName;
      } else {
        selectedNode = state.selectedNode;
      }
      return { ...state, nodesList: [...nodesList], selectedNode };
    }
    case CHANGE_PATH: {
      return { ...state, selectedPath: action.label };
    }
    case ADD_PATH: {
      const selectedPath = action.path.label;
      return { ...state, selectedPath, pathsList: [...state.pathsList, action.path] };
    }
    case REMOVE_PATH: {
      const pathsList = state.pathsList.filter(item => item.label !== action.label);
      let selectedPath = '';
      if (action.label === state.selectedPath) {
        selectedPath = pathsList[pathsList.length - 1].label;
      } else {
        selectedPath = state.selectedPath;
      }
      return { ...state, pathsList: [...pathsList], selectedPath };
    }
    default:
      return state;
  }
}
