import {
  changeLocaleAction,
  changeNodeAction,
  addNodeAction,
  removeNodeAction,
  changePathAction,
  addPathAction,
  removePathAction
} from './actions';

import { setWalletSettings } from '../../utils/settings';
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
    setWalletSettings(state.settings);
  };
}

export function changeNodeThunk(name: string) {
  return (dispatch, state) => {
    dispatch(changeNodeAction(name));
    setWalletSettings(state.settings);
  };
}

export function addNodeThunk(node: Node) {
  return (dispatch, state) => {
    dispatch(addNodeAction(node));
    setWalletSettings(state.settings);
  };
}

export function removeNodeThunk(name: string) {
  return (dispatch, state) => {
    dispatch(removeNodeAction(name));
    setWalletSettings(state.settings);
  };
}

export function changePathThunk(label: string) {
  return (dispatch, state) => {
    dispatch(changePathAction(label));
    setWalletSettings(state.settings);
  };
}

export function addPathThunk(path: Path) {
  return (dispatch, state) => {
    dispatch(addPathAction(path));
    setWalletSettings(state.settings);
  };
}

export function removePathThunk(label: string) {
  return (dispatch, state) => {
    dispatch(removePathAction(label));
    setWalletSettings(state.settings);
  };
}
