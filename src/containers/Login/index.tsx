import React from 'react';
import { Route, Switch, RouteComponentProps } from 'react-router-dom';
import LoginHome from '../LoginHome';
import LoginImport from '../LoginImport';
import LoginCreate from '../LoginCreate';
import LoginConditions from '../LoginConditions';

function Login(props: RouteComponentProps<{ path: string }>) {
    const { match } = props;
    return (
        <Switch>
            <Route path={`${match.path}/home`} component={LoginHome} />
            <Route path={`${match.path}/import`} component={LoginImport} />
            <Route path={`${match.path}/create`} component={LoginCreate} />
            <Route path={`${match.path}/conditions/:type`} component={LoginConditions} />
            <Route component={LoginHome} />
        </Switch>
    );
}

export default Login;
