import { combineReducers } from 'redux';
import { createRouterReducer } from '@lagunovsky/redux-react-router';

import { settingsReducer } from '../containers/Settings/duck/reducer';

import { appReducer } from './app/reducers';
import { messageReducer } from './message/reducers';
import { modalReducer } from './modal/reducers';
import { nftReducer } from './nft/reducers';
import { walletReducer } from './wallet/reducers';

export default function createRootReducer(history: any) {
    return combineReducers({
        router: createRouterReducer(history),
        wallet: walletReducer,
        settings: settingsReducer,
        message: messageReducer,
        app: appReducer,
        modal: modalReducer,
        nft: nftReducer,
    });
}
