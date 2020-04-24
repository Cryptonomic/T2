import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { walletReducer } from './wallet/reducers';
import { messageReducer } from './message/reducers';
import { settingsReducer } from '../containers/Settings/duck/reducer';
import { appReducer } from './app/reducers';
import { modalReducer } from './modal/reducers';

export default function createRootReducer(history: any) {
    return combineReducers({
        router: connectRouter(history),
        wallet: walletReducer,
        settings: settingsReducer,
        message: messageReducer,
        app: appReducer,
        modal: modalReducer
    });
}
