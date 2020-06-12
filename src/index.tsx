import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { registerFetch, registerLogger } from 'conseiljs';
import fetch from 'node-fetch';
import * as log from 'loglevel';

import { logLevel } from './config.json';
import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
import './utils/i18n';
import './styles/app.global.scss';

const store = configureStore();

const logger = log.getLogger('conseiljs');
logger.setLevel(logLevel as log.LogLevelDesc, false);
registerLogger(logger);
registerFetch(fetch);

ReactDOM.render(
    <AppContainer>
        <Root store={store} history={history} />
    </AppContainer>,
    document.getElementById('root')
);
