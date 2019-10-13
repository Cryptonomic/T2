import React from 'react';
import { Switch, Route } from 'react-router';
import App from './containers/App';
import Home from './containers/Home';

const Routes = () => (
  <App>
    <Switch>
      <Route path="/" component={Home} />
    </Switch>
  </App>
);

export default Routes;
