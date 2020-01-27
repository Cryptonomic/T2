import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Redirect, useLocation } from 'react-router';
import styled from 'styled-components';
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
import Routes from '../../router/routes';

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
  const location = useLocation();

  useEffect(() => {
    getNewVersion();
  }, []);

  if (!isNodes) {
    return <Redirect to="/walletNodesRequired" />;
  }

  if (isLoggedIn && location.pathname === '/login') {
    return <Redirect to="/home" />;
  }

  if (!isLoggedIn && !isLedger && location.pathname === '/home') {
    return <Redirect to="/login" />;
  }

  return (
    <Container>
      <TopBar
        walletName={walletName}
        isLoggedIn={isLoggedIn}
        isExtended={!!newVersion}
        logout={logout}
      />
      {newVersion && <VersionStatus version={newVersion} />}
      <Routes />
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
