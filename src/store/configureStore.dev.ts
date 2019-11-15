import { createStore, applyMiddleware, compose, Store } from 'redux';
import reduxThunk from 'redux-thunk';
import { createHashHistory } from 'history';
import { routerMiddleware, routerActions } from 'connected-react-router';
import { createLogger } from 'redux-logger';
import createRootReducer from '../reduxContent';
import * as walletActions from '../reduxContent/wallet/actions';
import { RootState } from '../types/store';

const history = createHashHistory();
const rootReducer = createRootReducer(history);

const configureStore = (initialState?: RootState): Store<RootState | undefined> => {
  // Redux Configuration
  const middleware: any[] = [];
  const enhancers: any[] = [];

  // Thunk Middleware
  middleware.push(reduxThunk);

  // Logging Middleware
  const logger = createLogger({
    level: 'info',
    collapsed: true
  });

  // Skip redux logs in console during the tests
  if (process.env.NODE_ENV !== 'test') {
    middleware.push(logger);
  }

  // Router Middleware
  const router = routerMiddleware(history);
  middleware.push(router);

  // Redux DevTools Configuration
  const actionCreators = {
    ...walletActions,
    ...routerActions
  };
  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Options: http://extension.remotedev.io/docs/API/Arguments.html
        actionCreators
      })
    : compose;

  // Apply Middleware & Compose Enhancers
  enhancers.push(applyMiddleware(...middleware));
  const enhancer = composeEnhancers(...enhancers);

  // Create Store
  const store = createStore(rootReducer, initialState, enhancer);

  if (typeof module.hot !== 'undefined') {
    module.hot.accept('../reduxContent', () =>
      store.replaceReducer(require('../reduxContent').default)
    );
  }

  return store;
};

export default { configureStore, history };
