import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Route, Switch, RouteComponentProps } from 'react-router-dom';
import Loader from '../../components/Loader';
import TopBar from '../../components/TopBar';
import VersionStatus from '../../components/VersionStatus';
import LoginHome from '../LoginHome';
import LoginImport from '../LoginImport';
import LoginCreate from '../LoginCreate';
import { RootState } from '../../types/store';

interface Props extends RouteComponentProps<{ path: string }> {
  isLoading: boolean;
  newVersion: string;
}

function Login(props: Props) {
  const { isLoading, match, newVersion } = props;

  return (
    <Fragment>
      <TopBar onlyLogo={true} />
      {newVersion && <VersionStatus version={newVersion} />}
      <Switch>
        <Route path={`${match.path}/home`} component={LoginHome} />
        <Route path={`${match.path}/import`} component={LoginImport} />
        <Route path={`${match.path}/create`} component={LoginCreate} />
        {/* <Route
          path={`${match.path}/conditions/:type`}
          component={LoginConditions}
        />
        <Route path={`${match.path}/settings`} component={HomeSettings} /> */}
        <Route component={LoginHome} />
      </Switch>
      {isLoading && <Loader />}
    </Fragment>
  );
}

const mapStateToProps = (state: RootState) => ({
  isLoading: state.wallet.isLoading,
  newVersion: state.wallet.newVersion
});

export default connect(
  mapStateToProps,
  null
)(Login) as React.ComponentType<any>;
