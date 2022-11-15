import type { RouteObject } from 'react-router-dom';
import { Outlet, Link, useRoutes, redirect } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Settings from './Settings';
import WalletNodesRequired from './WalletNodesRequired';
import HomeMain from './HomeMain';
import HomeAdd from './HomeAdd';
import LoginHome from './LoginHome';
import LoginImport from './LoginImport';
import LoginCreate from './LoginCreate';
import LoginConditions from './LoginConditions';
import RequireAuth from './Auth';
// import { getLocalData } from '../utils/localData';

export const routes: RouteObject[] = [
    {
        path: '/',
        element: (
            <RequireAuth>
                <Home />
            </RequireAuth>
        ),
        children: [
            { index: true, element: <HomeMain /> },
            { path: '/add', element: <HomeAdd /> },
        ],
    },
    { path: '/settings', element: <Settings /> },
    { path: '/walletNodesRequired', element: <WalletNodesRequired /> },
    { path: '/login/import', element: <LoginImport /> },
    { path: '/login/home', element: <LoginHome /> },
    { path: '/login/create', element: <LoginCreate /> },
];
