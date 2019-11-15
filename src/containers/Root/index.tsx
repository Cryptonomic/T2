import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { ThemeProvider } from 'styled-components';
import { hot } from 'react-hot-loader/root';
import theme from '../../styles/theme';
import Routes from '../../Routes';
import Loader from '../../components/Loader';
// import { getLocale } from '../../reduxContent/settings/selectors';

const App = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes />
    </Suspense>
  );
};

interface Props {
  store: any;
  history: any;
}

const Root = ({ store, history }: Props) => (
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <ConnectedRouter history={history}>
        <App />
      </ConnectedRouter>
    </ThemeProvider>
  </Provider>
);
export default hot(Root);
