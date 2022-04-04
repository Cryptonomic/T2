import React, { Fragment, useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router';
import { useTranslation } from 'react-i18next';
import Transport from '@ledgerhq/hw-transport-node-hid';
import { BigNumber } from 'bignumber.js';

import { goHomeAndClearState } from '../../reduxContent/wallet/thunks';
import { getIsIdentitesSelector } from '../../reduxContent/wallet/selectors';
import { createMessageAction } from '../../reduxContent/message/actions';

import NodesStatus from '../../components/NodesStatus';
import HomeMain from '../HomeMain';
import HomeAdd from '../HomeAdd';

import { getNodesError } from '../../utils/general';
import { RootState, AppState } from '../../types/store';

function HomePage() {
    const { t } = useTranslation();
    const { isLedger, nodesStatus } = useSelector<RootState, AppState>((state) => state.app, shallowEqual);
    const isIdentities = useSelector(getIsIdentitesSelector);
    const nodesErrorMessage = getNodesError(nodesStatus);
    const dispatch = useDispatch();

    async function onDetectLedger() {
        Transport.listen({
            next: (e) => {
                if (e.type === 'remove' && isLedger) {
                    onLogout();
                }
            },
            error: (e) => {
                console.error(e);
            },
        });
    }

    function onLogout() {
        dispatch(goHomeAndClearState());
        dispatch(createMessageAction('general.errors.no_ledger_detected', true));
    }

    useEffect(() => {
        onDetectLedger();
    }, []);

    const redirectTo = isIdentities ? '/home/main' : '/home/add';

    BigNumber.config({ EXPONENTIAL_AT: 54 });

    return (
        <Fragment>
            {nodesErrorMessage && <NodesStatus message={t(nodesErrorMessage)} />}
            <Switch>
                <Route path="/home/main" component={HomeMain} />
                <Route path="/home/add" component={HomeAdd} />
                <Redirect to={redirectTo} />
            </Switch>
        </Fragment>
    );
}

export default HomePage;
