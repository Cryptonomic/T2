import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { ThemeProvider } from 'styled-components';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { hot } from 'react-hot-loader/root';
import theme from '../../styles/theme';
import muiTheme from '../../styles/muiTheme';
import App from '../App';
import Loader from '../../components/Loader';
// import { getLocale } from '../../reduxContent/settings/selectors';

interface Props {
    store: any;
    history: any;
}

const Root = ({ store, history }: Props) => (
    <Provider store={store}>
        <MuiThemeProvider theme={muiTheme}>
            <ThemeProvider theme={theme}>
                <ConnectedRouter history={history}>
                    <Suspense fallback={<Loader />}>
                        <App />
                    </Suspense>
                </ConnectedRouter>
            </ThemeProvider>
        </MuiThemeProvider>
    </Provider>
);
export default hot(Root);
