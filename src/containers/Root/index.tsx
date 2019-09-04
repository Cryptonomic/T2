import * as React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { ThemeProvider } from 'styled-components';
import { hot } from 'react-hot-loader/root';
import theme from '../../utils/theme';
import Routes from '../../Routes';
// import { getLocale } from '../../reduxContent/settings/selectors';

type Props = {
  store: any;
  history: any;
};

const Root = ({ store, history }: Props) => (
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <ConnectedRouter history={history}>
        <Routes />
      </ConnectedRouter>
    </ThemeProvider>
  </Provider>
);
export default hot(Root);
