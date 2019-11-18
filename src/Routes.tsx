import React from 'react';
import { Switch, Route, Redirect } from 'react-router';
import App from './containers/App';
import Home from './containers/Home';
import Login from './containers/Login';
import WalletNodesRequired from './containers/WalletNodesRequired';

import { isLoggedIn, isSetLedger } from './utils/login';

const Routes = store => {
  const state = store.store.store.getState();
  return (
    <App>
      <Switch>
        <Route
          path="/home"
          render={props => {
            // if (!hasNodes(state)) {
            //   return <Redirect to="/walletNodesRequired" />;
            // }

            if (!isLoggedIn(state.wallet) && !isSetLedger(state.wallet)) {
              return <Redirect to="/login" />;
            }

            return <Home {...props} />;
          }}
        />
        <Route path="/walletNodesRequired" component={WalletNodesRequired} />
        <Route
          path="/login"
          render={props => {
            // if (!hasNodes(state)) {
            //   return <Redirect to="/walletNodesRequired" />;
            // }

            if (isLoggedIn(state.wallet)) {
              return <Redirect to="/home" />;
            }

            return <Login {...props} />;
          }}
        />
        <Redirect from="/" to="/home" />
      </Switch>
    </App>
  );
};

// const Routes = (store: any) => {
//   console.log('store------', store.store.store.getState());
//   return (
//     <App>
//       <Switch>
//         {/* <Route path="/" component={Home} /> */}
//         <Route path="/" component={Login} />
//       </Switch>
//     </App>
//   );
// }
export default Routes;
