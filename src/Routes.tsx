import * as React from 'react';
import { Switch, Route } from 'react-router';
import App from './containers/App';
import CounterContainer from './containers/CounterContainer';

const Routes = () => (
  <App>
    <Switch>
      <Route path="/" component={CounterContainer} />
    </Switch>
  </App>
);

export default Routes;
