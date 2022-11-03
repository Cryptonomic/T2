import React, { Fragment, useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { Outlet } from 'react-router';
// import Transport from '@ledgerhq/hw-transport-node-hid';
import { BigNumber } from 'bignumber.js';

import { goHomeAndClearState } from '../../reduxContent/wallet/thunks';
import { getIsIdentitesSelector } from '../../reduxContent/wallet/selectors';
import { createMessageAction } from '../../reduxContent/message/actions';

import NodesStatus from '../../components/NodesStatus';

import { getNodesError } from '../../utils/general';
import { RootState, AppState, SettingsState } from '../../types/store';

function HomePage() {
    const { isLedger, nodesStatus } = useSelector<RootState, AppState>((state) => state.app, shallowEqual);
    const { nodesList, selectedNode } = useSelector<RootState, SettingsState>((state) => state.settings, shallowEqual);
    const isIdentities = useSelector(getIsIdentitesSelector);
    const nodesErrorMessage = getNodesError(nodesStatus, nodesList, selectedNode);
    const dispatch = useDispatch();

    async function onDetectLedger() {
        // Todo
        // Transport.listen({
        //     next: (e) => {
        //         if (e.type === 'remove' && isLedger) {
        //             onLogout();
        //         }
        //     },
        //     error: (e) => {
        //         console.error(e);
        //     },
        // });
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
        <>
            {nodesErrorMessage && <NodesStatus message={nodesErrorMessage} />}
            <Outlet />
        </>
    );
}

export default HomePage;
