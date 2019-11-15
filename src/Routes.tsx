import React from 'react';
import { Switch, Route } from 'react-router';
import App from './containers/App';
import Home from './containers/Home';
import Login from './containers/Login';

const Routes = () => (
  <App>
    <Switch>
      {/* <Route path="/" component={Home} /> */}
      <Route path="/" component={Login} />
    </Switch>
  </App>
);

export default Routes;
