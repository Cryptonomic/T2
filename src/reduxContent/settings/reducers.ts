import { remote } from 'electron';
import {
  CHANGE_LOCALE,
  CHANGE_NODE,
  ADD_NODE,
  REMOVE_NODE,
  CHANGE_PATH,
  ADD_PATH,
  REMOVE_PATH,
  CLEAR_STATE,
  HIDE_DELEGATE_TOOLTIP,
  SettingsActionTypes
} from './types';

import { SettingsState } from '../../types/store';

const initState: SettingsState = {
  locale: remote.app.getLocale(),
  selectedNode: '',
  nodesList: [],
  delegateTooltip: false,
  selectedPath: '',
  pathsList: []
};

export function settingsReducer(state = initState, action: SettingsActionTypes): SettingsState {
  switch (action.type) {
    case CHANGE_LOCALE: {
      return { ...state, locale: action.locale };
    }
    case CHANGE_NODE: {
      return { ...state, selectedNode: action.name };
    }
    case ADD_NODE: {
      return { ...state, nodesList: [...state.nodesList, action.node] };
    }
    case REMOVE_NODE: {
      const nodesList = state.nodesList.filter(item => item.displayName !== action.name);
      return { ...state, nodesList: [...nodesList] };
    }
    case CHANGE_PATH: {
      return { ...state, selectedPath: action.label };
    }
    case ADD_PATH: {
      return { ...state, pathsList: [...state.pathsList, action.path] };
    }
    case REMOVE_PATH: {
      const pathsList = state.pathsList.filter(item => item.label !== action.label);
      return { ...state, pathsList: [...pathsList] };
    }
    default:
      return state;
  }
}
