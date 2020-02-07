import React from 'react';
import ReactDOM from 'react-dom';
import { StoreContext } from 'redux-react-hook';
import { AppContainer } from 'react-hot-loader';
import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
import './utils/i18n';
import './styles/app.global.scss';

const store = configureStore();

ReactDOM.render(
  <StoreContext.Provider value={store}>
    <AppContainer>
      <Root store={store} history={history} />
    </AppContainer>
  </StoreContext.Provider>,
  document.getElementById('root')
);
