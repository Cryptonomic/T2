import { createHashHistory } from 'history';
import { createStore, applyMiddleware, Store } from 'redux';
import reduxThunk from 'redux-thunk';
import { routerMiddleware } from 'connected-react-router';
import createRootReducer, { RootState } from '../reduxContent';

const history = createHashHistory();
const router = routerMiddleware(history);
const enhancer = applyMiddleware(reduxThunk, router);
const rootReducer = createRootReducer(history);

const configureStore = (initialState?: RootState): Store<RootState | undefined> => {
  return createStore(rootReducer, initialState, enhancer);
};

export default { configureStore, history };
