import { app } from 'electron';
import React, { useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { Route, Switch, Redirect } from 'react-router-dom';
import styled from 'styled-components';
import { ipcRenderer } from 'electron';
import base58check from 'bs58check';

import config from '../../config.json';

import Home from '../Home';
import Login from '../Login';
import Settings from '../Settings';
import WalletNodesRequired from '../WalletNodesRequired';
import Loader from '../../components/Loader';
import TopBar from '../../components/TopBar';
import VersionStatus from '../../components/VersionStatus';
import MessageBar from '../../components/MessageBar';
import { createMessageAction } from '../../reduxContent/message/actions';
import { setLaunchUrl } from '../../reduxContent/app/actions';
import { setModalOpen, setModalValue, setModalActiveTab } from '../../reduxContent/modal/actions';
import { getNewVersionThunk } from '../../reduxContent/app/thunks';
import { getIsNodesSelector } from '../../reduxContent/settings/selectors';
import { getWalletName } from '../../reduxContent/wallet/selectors';
import { getLoggedIn } from '../../utils/login';
import { RootState, WalletState, AppState } from '../../types/store';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding: 0;
`;

function App() {
    const dispatch = useDispatch();
    const wallet = useSelector<RootState, WalletState>((state) => state.wallet, shallowEqual);
    const { newVersion, isLedger, isLoading } = useSelector<RootState, AppState>((state) => state.app, shallowEqual);
    const walletName = useSelector(getWalletName);
    const isNodes = useSelector(getIsNodesSelector);
    const isLoggedIn = getLoggedIn(wallet);

    localStorage.removeItem('initIndex');
    localStorage.removeItem('isTos');
    localStorage.removeItem('isPP');

    useEffect(() => {
        dispatch(getNewVersionThunk());

        ipcRenderer.on('showMessage', (event, msg) => {
            dispatch(createMessageAction(msg, false));
        });

        ipcRenderer.on('login', (event, msg, args) => {
            dispatch(createMessageAction(msg, true));

            let param = '';
            console.log('ipcRenderer/login', args);
            if (Array.isArray(args)) {
                console.log(`ipcRenderer/login parsed`, args[1]);
                param = args[1];
            } else if (args.split(',').length > 1) {
                console.log(
                    `ipcRenderer/login split`,
                    args
                        .split(',')
                        .map((s) => s.trim())
                        .map((ss) => `"${ss}"`)
                );
                param = args.split(',').map((s) => s.trim())[1];
            } else {
                console.log(`ipcRenderer/login unparsed`, args);
                param = args;
            }

            if (param.length > 0) {
                dispatch(setLaunchUrl(param));
            }
        });

        ipcRenderer.on('wallet', (event, url) => {
            const urlProps = new URL(url);
            const pathname = urlProps.pathname.slice(2);
            const searchParams = urlProps.searchParams;

            try {
                if (searchParams.has('type') && searchParams.get('type') === 'tzip10') {
                    const beaconRequest = searchParams.get('data') || '';

                    if (config.beaconEnable) {
                        dispatch(setModalValue(JSON.parse(base58check.decode(beaconRequest)), 'beaconRegistration'));
                        dispatch(setModalOpen(true, 'beaconRegistration'));
                    } else {
                        dispatch(setModalValue(JSON.parse(base58check.decode(beaconRequest)), 'beaconDisable'));
                        dispatch(setModalOpen(true, 'beaconDisable'));
                    }

                    app.focus();
                } else if (['sign', 'beaconRegistration', 'beaconEvent'].includes(pathname) && searchParams.has('r')) {
                    const req = searchParams.get('r') || '';
                    dispatch(setModalValue(JSON.parse(Buffer.from(req, 'base64').toString('utf8')), pathname));

                    if (pathname === 'sign') {
                        dispatch(setModalActiveTab(pathname));
                        dispatch(setModalOpen(true, pathname));
                    } else if (config.beaconEnable) {
                        dispatch(setModalOpen(true, pathname));
                    } else if (!config.beaconEnable) {
                        dispatch(setModalValue({}, pathname));
                        dispatch(setModalValue(JSON.parse(Buffer.from(req, 'base64').toString('utf8')), 'beaconDisable'));
                        dispatch(setModalOpen(true, 'beaconDisable'));
                    }

                    app.focus();
                }
            } catch (err) {
                console.log('error processing beacon request', err, searchParams);
            }
        });
    }, []);

    return (
        <Container>
            <TopBar walletName={walletName} isLoggedIn={isLoggedIn} isExtended={!!newVersion} />
            {newVersion && <VersionStatus version={newVersion} />}
            <Switch>
                <Route
                    path="/home"
                    render={() => {
                        if (!isNodes) {
                            return <Redirect to="/walletNodesRequired" />;
                        }

                        if (!isLoggedIn && !isLedger) {
                            return <Redirect to="/login" />;
                        }

                        return <Home />;
                    }}
                />
                <Route path="/walletNodesRequired" component={WalletNodesRequired} />
                <Route path="/settings" component={Settings} />
                <Route
                    path="/login"
                    render={(routerProps) => {
                        if (!isNodes) {
                            return <Redirect to="/walletNodesRequired" />;
                        }

                        if (isLoggedIn) {
                            return <Redirect to="/home" />;
                        }

                        return <Login {...routerProps} />;
                    }}
                />
                <Redirect from="/" to="/home" />
            </Switch>
            <MessageBar />
            {isLoading && <Loader />}
        </Container>
    );
}

export default App;
