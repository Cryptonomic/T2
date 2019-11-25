import {
  CHANGE_LOCALE,
  ChangeLocaleAction,
  CHANGE_NODE,
  ChangeNodeAction,
  ADD_NODE,
  AddNodeAction,
  REMOVE_NODE,
  RemoveNodeAction,
  CHANGE_PATH,
  ChangePathAction,
  ADD_PATH,
  AddPathAction,
  REMOVE_PATH,
  RemovePathAction
} from './types';

import { Node, Path } from '../../types/general';

export function changeLocaleAction(locale: string): ChangeLocaleAction {
  return {
    type: CHANGE_LOCALE,
    locale
  };
}

export function changeNodeAction(name: string): ChangeNodeAction {
  return {
    type: CHANGE_NODE,
    name
  };
}

export function addNodeAction(node: Node): AddNodeAction {
  return {
    type: ADD_NODE,
    node
  };
}

export function removeNodeAction(name: string): RemoveNodeAction {
  return {
    type: REMOVE_NODE,
    name
  };
}

export function changePathAction(label: string): ChangePathAction {
  return {
    type: CHANGE_PATH,
    label
  };
}

export function addPathAction(path: Path): AddPathAction {
  return {
    type: ADD_PATH,
    path
  };
}

export function removePathAction(label: string): RemovePathAction {
  return {
    type: REMOVE_PATH,
    label
  };
}
