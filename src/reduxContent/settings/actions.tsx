import { setLocalData } from '../../utils/localData';
import { Node, Path } from '../../types/general';

export const CHANGE_LOCALE = 'CHANGE_LOCALE';
export const CHANGE_NODE = 'CHANGE_NODE';
export const ADD_NODE = 'ADD_NODE';
export const REMOVE_NODE = 'REMOVE_NODE';
export const CHANGE_PATH = 'CHANGE_PATH';
export const ADD_PATH = 'ADD_PATH';
export const REMOVE_PATH = 'REMOVE_PATH';
export const CLEAR_STATE = 'CLEAR_STATE';

export const changeLocaleThunk = (locale: string) => {
  return (dispatch, state) => {
    dispatch({ type: CHANGE_LOCALE, locale });
    setLocalData('settings.locale', locale);
  };
};

export const changeNodeThunk = (name: string) => {
  return (dispatch, state) => {
    dispatch({ type: 'CHANGE_NODE', name });
    setLocalData('settings.selectedNode', name);
  };
};

export const addNodeThunk = (node: Node) => {
  return (dispatch, state) => {
    dispatch({ type: 'ADD_NODE', node });
    setLocalData('settings.nodesList', state.settings.nodesList);
    setLocalData('settings.selectedNode', state.settings.selectedNode);
  };
};

export const removeNodeThunk = (name: string) => {
  return (dispatch, state) => {
    dispatch({ type: 'REMOVE_NODE', name });
    setLocalData('settings.nodesList', state.settings.nodesList);
    setLocalData('settings.selectedNode', state.settings.selectedNode);
  };
};

export const changePathThunk = (label: string) => {
  return (dispatch, state) => {
    dispatch({ type: 'CHANGE_PATH', label });
    setLocalData('settings.selectedPath', label);
  };
};

export const addPathThunk = (path: Path) => {
  return (dispatch, state) => {
    dispatch({ type: 'ADD_PATH', path });
    setLocalData('settings.pathsList', state.settings.pathsList);
    setLocalData('settings.selectedPath', state.settings.selectedPath);
  };
};

export const removePathThunk = (label: string) => {
  return (dispatch, state) => {
    dispatch({ type: 'REMOVE_PATH', label });
    setLocalData('settings.pathsList', state.settings.pathsList);
    setLocalData('settings.selectedPath', state.settings.selectedPath);
  };
};
