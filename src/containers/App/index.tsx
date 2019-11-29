import React from 'react';
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

import { getWalletName } from '../../reduxContent/wallet/selectors';
import { getLoggedIn } from '../../utils/login';
import { RootState, WalletState } from '../../types/store';

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
}

function App(props: Props) {
  const { wallet, newVersion, isLoading, walletName, isLedger } = props;
  const isLoggedIn = getLoggedIn(wallet, isLedger);
  return (
    <Container>
      <TopBar walletName={walletName} isLoggedIn={isLoggedIn} isExtended={!!newVersion} />
      {newVersion && <VersionStatus version={newVersion} />}
      <Switch>
        <Route
          path="/home"
          render={routerProps => {
            // if (!hasNodes(state)) {
            //   return <Redirect to="/walletNodesRequired" />;
            // }

            if (!isLoggedIn) {
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
            // if (!hasNodes(state)) {
            //   return <Redirect to="/walletNodesRequired" />;
            // }

            if (isLoggedIn) {
              return <Redirect to="/home" />;
            }

            return <Login {...routerProps} />;
          }}
        />
        <Redirect from="/" to="/home" />
      </Switch>
      {isLoading && <Loader />}
    </Container>
  );
}

const mapStateToProps = (state: RootState) => ({
  wallet: state.wallet,
  newVersion: state.app.newVersion,
  isLoading: state.app.isLoading,
  walletName: getWalletName(state),
  isLedger: state.app.isLedger
});

export default connect(
  mapStateToProps,
  null
)(App) as React.ComponentType<any>;
