import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
import './utils/i18n';
import './styles/app.scss';

// Create main element
const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

const store = configureStore();

ReactDOM.render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  mainElement
);
