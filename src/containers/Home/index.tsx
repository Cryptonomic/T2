import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router';
import { withTranslation, WithTranslation } from 'react-i18next';
import { compose } from 'redux';
// import Transport from '@ledgerhq/hw-transport-node-hid';

import { goHomeAndClearState } from '../../reduxContent/wallet/thunks';
// import { addMessage } from '../../reduxContent/message/thunks';
// import { getNewVersion } from '../../reduxContent/message/selectors';
// import { initLedgerTransport } from '../../utils/wallet';

import NodesStatus from '../../components/NodesStatus';
// import HomeAddresses from './../HomeAddresses';
import HomeAdd from './../HomeAdd';

import { getNodesError } from '../../utils/general';
import { RootState } from '../../types/store';
import { NodeStatus } from '../../types/general';

interface OwnProps {
  identities: any[];
  isLoading: boolean;
  nodesStatus: NodeStatus;
  // match: object,
  // goHomeAndClearState: () => {};
  // addMessage: () => {},
  // isLedger: boolean,
  // newVersion: string
}

type Props = OwnProps & WithTranslation;

function HomePage(props: Props) {
  const { identities, nodesStatus, isLoading, t } = props;
  const nodesErrorMessage = getNodesError(nodesStatus);

  async function onDetectLedger() {
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
  }

  function onLogout() {
    // const { goHomeAndClearState } = this.props;
    // const { goHomeAndClearState, addMessage } = this.props;
    // initLedgerTransport();
    goHomeAndClearState();
    // addMessage('general.errors.no_ledger_detected', true);
  }

  const redirectTo = identities.length > 0 ? '/home/main' : '/home/add';

  return (
    <Fragment>
      {nodesErrorMessage && <NodesStatus message={t(nodesErrorMessage)} />}
      <Switch>
        {/* <Route path='/home/main' component={HomeAddresses} /> */}
        <Route path="/home/add" component={HomeAdd} />
        <Redirect to={redirectTo} />
      </Switch>
    </Fragment>
  );
}

const mapStateToProps = (state: RootState) => ({
  identities: state.wallet.identities,
  isLoading: state.app.isLoading,
  isLedger: state.app.isLedger,
  newVersion: state.app.newVersion,
  nodesStatus: state.app.nodesStatus
});

const mapDispatchToProps = dispatch => ({
  // goHomeAndClearState: () => dispatch(goHomeAndClearState())
});

export default compose(
  withTranslation(),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(HomePage) as React.ComponentType<any>;
