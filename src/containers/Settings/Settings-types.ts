import { Node, Path } from '../../types/general';

import {
  CHANGE_LOCALE,
  CHANGE_NODE,
  ADD_NODE,
  REMOVE_NODE,
  CHANGE_PATH,
  ADD_PATH,
  REMOVE_PATH
} from './Settings-actions';

export interface OwnProps {
  selectedNode: string;
  nodesList: Node[];
  selectedPath: string;
  pathsList: Path[];
  locale: string;
  changePath: (label: string) => void;
  removeNode: (name: string) => void;
  removePath: (label: string) => void;
  changeLocale: (locale: string) => void;
  changeNode: (name: string) => void;
  addNode: (node: Node) => void;
  addPath: (path: Path) => void;
}

export type Props = OwnProps;

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
