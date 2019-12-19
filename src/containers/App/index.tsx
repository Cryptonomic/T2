import React, { useEffect } from 'react';
import { connect } from 'react-redux';
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
import { goHomeAndClearState } from '../../reduxContent/wallet/thunks';
import { clearMessageAction } from '../../reduxContent/message/actions';
import { getIsNodesSelector } from '../../reduxContent/settings/selectors';
import { getWalletName } from '../../reduxContent/wallet/selectors';
import { getLoggedIn } from '../../utils/login';
import { RootState, WalletState, MessageState } from '../../types/store';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0;
`;

interface Props {
  wallet: WalletState;
  newVersion: string;
  isLoading: boolean;
  walletName: string;
  isLedger: boolean;
  isNodes: boolean;
  message: MessageState;
  getNewVersion: () => void;
  clearMessage: () => void;
  logout: () => void;
}

function App(props: Props) {
  const {
    wallet,
    newVersion,
    isLoading,
    walletName,
    isLedger,
    isNodes,
    message,
    clearMessage,
    getNewVersion,
    logout
  } = props;
  const isLoggedIn = getLoggedIn(wallet);

  useEffect(() => {
    getNewVersion();
  }, []);

  return (
    <Container>
      <TopBar
        walletName={walletName}
        isLoggedIn={isLoggedIn}
        isExtended={!!newVersion}
        logout={logout}
      />
      {newVersion && <VersionStatus version={newVersion} />}
      <Switch>
        <Route
          path="/home"
          render={routerProps => {
            if (!isNodes) {
              return <Redirect to="/walletNodesRequired" />;
            }

            if (!isLoggedIn && !isLedger) {
              return <Redirect to="/login" />;
            }

            return <Home {...routerProps} />;
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
      <MessageBar message={message} clear={clearMessage} />
      {isLoading && <Loader />}
    </Container>
  );
}

const mapStateToProps = (state: RootState) => ({
  wallet: state.wallet,
  newVersion: state.app.newVersion,
  isLoading: state.app.isLoading,
  walletName: getWalletName(state),
  isLedger: state.app.isLedger,
  isNodes: getIsNodesSelector(state),
  message: state.message
});

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(goHomeAndClearState()),
  clearMessage: () => dispatch(clearMessageAction()),
  getNewVersion: () => dispatch(getNewVersionThunk())
});

export default connect(mapStateToProps, mapDispatchToProps)(App) as React.ComponentType<any>;
