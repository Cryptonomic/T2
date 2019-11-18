import { remote } from 'electron';
import {
  SET_SELECTED,
  SET_LOCALE,
  SET_PATH,
  ADD_NODE,
  REMOVE_NODE,
  UPDATE_NODE,
  ADD_PATH,
  REMOVE_PATH,
  UPDATE_PATH,
  CLEAR_STATE,
  HIDE_DELEGATE_TOOLTIP,
  SET_NETWORK,
  SettingsActionTypes
} from './types';

import { SettingsState } from '../../types/store';

const initState: SettingsState = {
  locale: remote.app.getLocale(),
  tezosSelectedNode: '',
  conseilSelectedNode: '',
  nodesList: [],
  delegateTooltip: false,
  selectedPath: '',
  pathsList: [],
  network: '',
  platform: ''
};

export function settingsReducer(state = initState, action: SettingsActionTypes): SettingsState {
  switch (action.type) {
    // case SET_SELECTED: {
    //   return { ...state, conseilSelectedNode: action.selected };
    // }
    case SET_LOCALE: {
      return { ...state, locale: action.locale };
    }
    default:
      return state;
  }
}
