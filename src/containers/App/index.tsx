import React, { useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { Route, Switch, Redirect } from 'react-router-dom';
import styled from 'styled-components';
import { ipcRenderer } from 'electron';

import Home from '../Home';
import Login from '../Login';
import Settings from '../Settings';
import WalletNodesRequired from '../WalletNodesRequired';
import Loader from '../../components/Loader';
import TopBar from '../../components/TopBar';
import VersionStatus from '../../components/VersionStatus';
import MessageBar from '../../components/MessageBar';
import { createMessageAction } from '../../reduxContent/message/actions';
import { setModalOpen, setModalTab, setModalActiveTab } from '../../reduxContent/modal/actions';
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
    const wallet = useSelector<RootState, WalletState>(state => state.wallet, shallowEqual);
    const { newVersion, isLedger, isLoading } = useSelector<RootState, AppState>(state => state.app, shallowEqual);
    const walletName = useSelector(getWalletName);
    const isNodes = useSelector(getIsNodesSelector);
    const isLoggedIn = getLoggedIn(wallet);

    useEffect(() => {
        dispatch(getNewVersionThunk());

        ipcRenderer.on('login', (event, msg) => {
            dispatch(createMessageAction(msg, true));
        });

        ipcRenderer.on('wallet', (event, url) => {
            const searchParams = new URLSearchParams(new URL(url).search);

            if (!searchParams.has('type') && !searchParams.has('text')) {
                return;
            }

            if (searchParams.get('type') === 'plain') {
                dispatch(setModalTab({ type: searchParams.get('type'), message: searchParams.get('text') }));
                dispatch(setModalActiveTab(searchParams.get('type')));
                dispatch(setModalOpen(true));
            }

            if (searchParams.get('type') === 'auth' && searchParams.has('callback') && searchParams.has('metadata')) {
                dispatch(
                    setModalTab({
                        type: searchParams.get('type'),
                        message: searchParams.get('text'),
                        callback: searchParams.get('callback'),
                        metadata: searchParams.get('metadata')
                    })
                );
                dispatch(setModalActiveTab(searchParams.get('type')));
                dispatch(setModalOpen(true));
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
                    render={routerProps => {
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
