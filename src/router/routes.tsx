import React from 'react';
import { Redirect, Route, Switch } from 'react-router';

import Home from '../containers/Home';
import HomeMain from '../containers/HomeMain';
import HomeAdd from '../containers/HomeAdd';
import LoginHome from '../containers/LoginHome';
import LoginImport from '../containers/LoginImport';
import LoginCreate from '../containers/LoginCreate';
import Settings from '../containers/Settings';
import WalletNodesRequired from '../containers/WalletNodesRequired';

export default (): React.ReactElement => (
  <>
    <Route exact={true} path="/home" component={Home} />
    <Switch>
      <Route exact={true} path="/home/main" component={HomeMain} />
      <Route exact={true} path="/home/add" component={HomeAdd} />
      <Route exact={true} path="/login" component={LoginHome} />
      <Route exact={true} path="/login/home" component={LoginHome} />
      <Route exact={true} path="/login/import" component={LoginImport} />
      <Route exact={true} path="/login/create" component={LoginCreate} />
      <Route exact={true} path="/settings" component={Settings} />
      <Route exact={true} path="/walletNodesRequired" component={WalletNodesRequired} />
      <Route exact={true} path="/">
        <Redirect to="/home" />
      </Route>
    </Switch>
  </>
);
