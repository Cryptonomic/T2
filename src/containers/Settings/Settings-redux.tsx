import React from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import SettingsContainer from './Settings-container';
import { RootState } from '../../types/store';
import { Node, Path } from '../../types/general';

import {
  removePathThunk,
  removeNodeThunk,
  changeLocaleThunk,
  changePathThunk,
  changeNodeThunk,
  addNodeThunk,
  addPathThunk
} from './Settings-actions';

const SettingsRedux = () => {
  const mapState = (state: RootState) => ({
    selectedNode: state.settings.selectedNode,
    nodesList: state.settings.nodesList,
    selectedPath: state.settings.selectedPath,
    pathsList: state.settings.pathsList,
    locale: state.settings.locale
  });

  const props = useMappedState(mapState);

  const dispatch = useDispatch();

  const actions = {
    changeLocale: (locale: string) => dispatch(changeLocaleThunk(locale)),
    changePath: (label: string) => dispatch(changePathThunk(label)),
    changeNode: (name: string) => dispatch(changeNodeThunk(name)),
    removePath: (label: string) => dispatch(removePathThunk(label)),
    removeNode: (name: string) => dispatch(removeNodeThunk(name)),
    addNode: (node: Node) => dispatch(addNodeThunk(node)),
    addPath: (path: Path) => dispatch(addPathThunk(path))
  };

  return <SettingsContainer {...props} {...actions} />;
};

export default SettingsRedux;
