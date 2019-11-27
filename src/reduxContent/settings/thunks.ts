import {
  changeLocaleAction,
  changeNodeAction,
  addNodeAction,
  removeNodeAction,
  changePathAction,
  addPathAction,
  removePathAction
} from './actions';
import { setLocalData } from '../../utils/localData';
import { Node, Path } from '../../types/general';
// export function hideDelegateTooltip(boolean) {
//   return (dispatch, state) => {
//     dispatch(_hideDelegateTooltip(boolean));
//     setWalletSettings(state.settings);
//   };
// }

export function changeLocaleThunk(locale: string) {
  return (dispatch, state) => {
    dispatch(changeLocaleAction(locale));
    setLocalData('settings.locale', locale);
  };
}

export function changeNodeThunk(name: string) {
  return (dispatch, state) => {
    dispatch(changeNodeAction(name));
    setLocalData('settings.selectedNode', name);
  };
}

export function addNodeThunk(node: Node) {
  return (dispatch, state) => {
    dispatch(addNodeAction(node));
    setLocalData('settings.nodesList', state.settings.nodesList);
    setLocalData('settings.selectedNode', state.settings.selectedNode);
  };
}

export function removeNodeThunk(name: string) {
  return (dispatch, state) => {
    dispatch(removeNodeAction(name));
    setLocalData('settings.nodesList', state.settings.nodesList);
    setLocalData('settings.selectedNode', state.settings.selectedNode);
  };
}

export function changePathThunk(label: string) {
  return (dispatch, state) => {
    dispatch(changePathAction(label));
    setLocalData('settings.selectedPath', label);
  };
}

export function addPathThunk(path: Path) {
  return (dispatch, state) => {
    dispatch(addPathAction(path));
    setLocalData('settings.pathsList', state.settings.pathsList);
    setLocalData('settings.selectedPath', state.settings.selectedPath);
  };
}

export function removePathThunk(label: string) {
  return (dispatch, state) => {
    dispatch(removePathAction(label));
    setLocalData('settings.pathsList', state.settings.pathsList);
    setLocalData('settings.selectedPath', state.settings.selectedPath);
  };
}
