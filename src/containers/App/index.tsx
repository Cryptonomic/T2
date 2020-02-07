import React, { useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { Route, Switch, Redirect } from 'react-router-dom';
import styled from 'styled-components';
import Home from '../Home';
import Login from '../Login';
import Settings from '../Settings';
import WalletNodesRequired from '../WalletNodesRequired';
import Loader from '../../components/Loader';
import TopBar from '../../components/TopBar';
import VersionStatus from '../../components/VersionStatus';
import MessageBar from '../../components/MessageBar';

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
  const { newVersion, isLedger, isLoading } = useSelector<RootState, AppState>(
    state => state.app,
    shallowEqual
  );
  const walletName = useSelector(getWalletName);
  const isNodes = useSelector(getIsNodesSelector);
  const isLoggedIn = getLoggedIn(wallet);

  useEffect(() => {
    dispatch(getNewVersionThunk());
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
