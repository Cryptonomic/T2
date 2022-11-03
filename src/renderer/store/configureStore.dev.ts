import { createStore, applyMiddleware, compose, Store } from 'redux';
import reduxThunk from 'redux-thunk';
import { createHashHistory } from 'history';
import { createRouterReducer, createRouterMiddleware, routerActions } from '@lagunovsky/redux-react-router';
import { createLogger } from 'redux-logger';
import createRootReducer from '../reduxContent';
import * as walletActions from '../reduxContent/wallet/actions';
import { RootState } from '../types/store';

const history = createHashHistory();
const rootReducer = createRootReducer(history);

export const routerReducer = createRouterReducer(history);

// const configureStore = (initialState?: RootState): Store<RootState | undefined> => {
const configureStore = (initialState?: RootState): any => {
    // Redux Configuration
    const middleware: any[] = [];
    const enhancers: any[] = [];

    // Thunk Middleware
    middleware.push(reduxThunk);

    // Logging Middleware
    const logger = createLogger({
        level: 'info',
        collapsed: true,
    });

    // Skip redux logs in console during the tests
    if (process.env.NODE_ENV !== 'test') {
        middleware.push(logger);
    }

    // Router Middleware
    const routerMiddleware = createRouterMiddleware(history);
    middleware.push(routerMiddleware);

    // Redux DevTools Configuration
    const actionCreators = {
        ...walletActions,
        ...routerActions,
    };

    const composeEnhancers = (process.env.NODE_ENV === 'development' && window && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

    // Apply Middleware & Compose Enhancers
    enhancers.push(applyMiddleware(...middleware));
    const enhancer = composeEnhancers(...enhancers);

    // Create Store
    const store = createStore(rootReducer, initialState, enhancer);

    // if (typeof module.hot !== 'undefined') {
    //   module.hot.accept('../reduxContent', () =>
    //     store.replaceReducer(require('../reduxContent').default)
    //   );
    // }

    return store;
};

// const configureStore = () => {
//   window.electron.store.set('foo', 'bar');
//     // or
//   console.log('tes1111111', window.electron.store.get('foo'));
//   return 5;
// }

export default { configureStore, history };
