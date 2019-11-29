import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router';
// import Transport from '@ledgerhq/hw-transport-node-hid';

import { goHomeAndClearState } from '../../reduxContent/wallet/thunks';
// import { addMessage } from '../../reduxContent/message/thunks';
// import { getNewVersion } from '../../reduxContent/message/selectors';
// import { initLedgerTransport } from '../../utils/wallet';

import Loader from '../../components/Loader';
import TopBar from '../../components/TopBar';
import NodesStatus from '../../components/NodesStatus';
import VersionStatus from '../../components/VersionStatus';

// import HomeAddresses from './../HomeAddresses';
// import HomeAddAddress from './../HomeAddAddress';
// import HomeSettings from './../HomeSettings';

import { RootState } from '../../types/store';

interface Props {
  identities: any[];
  isLoading: boolean;
  // match: object,
  // goHomeAndClearState: () => {};
  // addMessage: () => {},
  // isLedger: boolean,
  // newVersion: string
}

class HomePage extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.onDetectLedger();
  }

  public onDetectLedger = async () => {
    // const { isLedger } = this.props;
    // Transport.listen({
    //   next: e => {
    //     if (e.type === 'remove' && isLedger) {
    //       this.onLogout();
    //     }
    //   },
    //   error: e => {
    //     console.error(e);
    //   },
    //   complete: () => {}
    // });
  };

  public onLogout = () => {
    // const { goHomeAndClearState } = this.props;
    // const { goHomeAndClearState, addMessage } = this.props;
    // initLedgerTransport();
    goHomeAndClearState();
    // addMessage('general.errors.no_ledger_detected', true);
  };

  public render() {
    // const { match, identities, isLoading, newVersion } = this.props;
    const { identities, isLoading } = this.props;
    // const redirectTo =
    //   !identities || !identities.size
    //     ? `${match.url}/addAddress`
    //     : `${match.url}/addresses`;

    return (
      <Fragment>
        <NodesStatus />
        {/* <Switch>
          <Route path={`${match.path}/addresses`} component={HomeAddresses} />
          <Route path={`${match.path}/addAddress`} component={HomeAddAddress} />
          <Route path={`${match.path}/settings`} component={HomeSettings} />
          <Redirect to={redirectTo} />
        </Switch> */}
        {isLoading && <Loader />}
      </Fragment>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  identities: state.wallet.identities,
  isLoading: state.app.isLoading,
  isLedger: state.app.isLedger,
  newVersion: state.app.newVersion
});

const mapDispatchToProps = dispatch => ({
  // goHomeAndClearState: () => dispatch(goHomeAndClearState())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HomePage);
