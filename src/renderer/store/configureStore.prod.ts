import { createHashHistory } from 'history';
import { createStore, applyMiddleware, Store } from 'redux';
import reduxThunk from 'redux-thunk';
import { createRouterReducer, createRouterMiddleware } from '@lagunovsky/redux-react-router';
import createRootReducer from '../reduxContent';
import { RootState } from '../types/store';

const history = createHashHistory();
const routerMiddleware = createRouterMiddleware(history);
const enhancer = applyMiddleware(reduxThunk, routerMiddleware);
const rootReducer = createRootReducer(history);

// const configureStore = (initialState?: RootState): Store<RootState | undefined> => {
//   return createStore(rootReducer, initialState, enhancer);
// };

const configureStore = (initialState?: RootState): any => {
    return createStore(rootReducer, initialState, enhancer);
};

export default { configureStore, history };
