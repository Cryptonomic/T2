import { applyMiddleware, createStore, Store } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import reduxThunk from 'redux-thunk';

import { rootReducer, RootState } from '../reduxContent';

const configureStore = (initialState?: RootState): Store<RootState | undefined> => {
  const middlewares: any[] = [];
  middlewares.push(reduxThunk);
  const enhancer = composeWithDevTools(applyMiddleware(...middlewares));
  return createStore(rootReducer, initialState, enhancer);
};

const store = configureStore();

if (typeof module.hot !== 'undefined') {
  module.hot.accept('../reduxContent', () =>
    store.replaceReducer(require('../reduxContent').rootReducer)
  );
}

export default store;
