import React, { Fragment, useEffect } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import { withTranslation, WithTranslation } from 'react-i18next';
import { compose } from 'redux';
import Transport from '@ledgerhq/hw-transport-node-hid';

import { goHomeAndClearState } from '../../reduxContent/wallet/thunks';
import { getIsIdentitesSelector } from '../../reduxContent/wallet/selectors';
import { createMessageAction } from '../../reduxContent/message/actions';
import { initLedgerTransport } from '../../utils/wallet';

import NodesStatus from '../../components/NodesStatus';

import { getNodesError } from '../../utils/general';
import { RootState } from '../../types/store';
import { NodeStatus } from '../../types/general';

interface OwnProps {
  isIdentities: boolean;
  nodesStatus: NodeStatus;
  isLedger: boolean;
  logout: () => void;
  addMessage: (message: string, isError: boolean) => void;
}

type Props = OwnProps & WithTranslation;

function HomePage(props: Props) {
  const { isIdentities, nodesStatus, isLedger, logout, addMessage, t } = props;
  const nodesErrorMessage = getNodesError(nodesStatus);

  async function onDetectLedger() {
    Transport.listen({
      next: e => {
        if (e.type === 'remove' && isLedger) {
          onLogout();
        }
      },
      error: e => {
        console.error(e);
      }
    });
  }

  function onLogout() {
    initLedgerTransport();
    logout();
    addMessage('general.errors.no_ledger_detected', true);
  }

  useEffect(() => {
    onDetectLedger();
  }, []);

  const redirectTo = isIdentities ? '/home/main' : '/home/add';

  return (
    <Fragment>
      {nodesErrorMessage && <NodesStatus message={t(nodesErrorMessage)} />}
      <Redirect to={redirectTo} />
    </Fragment>
  );
}

const mapStateToProps = (state: RootState) => ({
  isIdentities: getIsIdentitesSelector(state),
  isLedger: state.app.isLedger,
  newVersion: state.app.newVersion,
  nodesStatus: state.app.nodesStatus
});

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(goHomeAndClearState()),
  addMessage: (message: string, isError: boolean) => dispatch(createMessageAction(message, isError))
});

export default compose(
  withTranslation(),
  connect(mapStateToProps, mapDispatchToProps)
)(HomePage) as React.ComponentType<any>;
