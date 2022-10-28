import React from 'react';
import { useLocation, Navigate } from "react-router-dom";

import { useSelector, shallowEqual } from 'react-redux';
import { getLoggedIn } from '../../utils/login';
import { RootState, WalletState, AppState } from '../../types/store';

export default function RequireAuth({ children }: { children: JSX.Element }) {
    let location = useLocation();
    const wallet = useSelector<RootState, WalletState>((state) => state.wallet, shallowEqual);
    const { isLedger } = useSelector<RootState, AppState>((state) => state.app, shallowEqual);
    const isLoggedIn = getLoggedIn(wallet);

    if (!isLoggedIn && !isLedger) {
        return <Navigate to="/login/home" state={{ from: location }} replace />;
    }
  
    return children;
}