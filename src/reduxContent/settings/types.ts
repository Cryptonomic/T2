import { Node, Path } from '../../types/general';

import {
  CHANGE_LOCALE,
  CHANGE_NODE,
  ADD_NODE,
  REMOVE_NODE,
  CHANGE_PATH,
  ADD_PATH,
  REMOVE_PATH
} from './actions';

export interface ChangeLocaleAction {
  type: typeof CHANGE_LOCALE;
  locale: string;
}
export interface ChangeNodeAction {
  type: typeof CHANGE_NODE;
  name: string;
}

export interface AddNodeAction {
  type: typeof ADD_NODE;
  node: Node;
}

export interface RemoveNodeAction {
  type: typeof REMOVE_NODE;
  name: string;
}

export interface ChangePathAction {
  type: typeof CHANGE_PATH;
  label: string;
}

export interface AddPathAction {
  type: typeof ADD_PATH;
  path: Path;
}

export interface RemovePathAction {
  type: typeof REMOVE_PATH;
  label: string;
}

export type SettingsActionTypes =
  | ChangeNodeAction
  | ChangeLocaleAction
  | AddNodeAction
  | RemoveNodeAction
  | AddPathAction
  | ChangePathAction
  | RemovePathAction;
