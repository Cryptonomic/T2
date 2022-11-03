import React, { useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useNavigate, useRoutes } from 'react-router-dom';
import styled from 'styled-components';
import config from '../../config.json';
import Loader from '../../components/Loader';
import TopBar from '../../components/TopBar';
import VersionStatus from '../../components/VersionStatus';
import MessageBar from '../../components/MessageBar';
import { createMessageAction } from '../../reduxContent/message/actions';
import { setLaunchUrl, setPlatformAction } from '../../reduxContent/app/actions';
import { setModalOpen, setModalValue, setModalActiveTab } from '../../reduxContent/modal/actions';
import { getNewVersionThunk } from '../../reduxContent/app/thunks';
import { getWalletName } from '../../reduxContent/wallet/selectors';
import { getLoggedIn } from '../../utils/login';
import { getWalletSettings } from '../../utils/settings';
import { RootState, WalletState, AppState } from '../../types/store';
import { routes } from '../routes';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding: 0;
`;

const App = () => {
    const dispatch = useDispatch();
    const element = useRoutes(routes);
    const navigate = useNavigate();
    const wallet = useSelector<RootState, WalletState>((state) => state.wallet, shallowEqual);
    const { newVersion, isLoading } = useSelector<RootState, AppState>((state) => state.app, shallowEqual);
    const walletName = useSelector(getWalletName);
    const isLoggedIn = getLoggedIn(wallet);

    localStorage.removeItem('initIndex');
    localStorage.removeItem('isTos');
    localStorage.removeItem('isPP');

    useEffect(() => {
        dispatch(getNewVersionThunk());
        dispatch(setPlatformAction(navigator.platform));

        window.electron.ipcRenderer.on('showMessage', (msg: any) => {
            dispatch(createMessageAction(msg, false));
        });

        window.electron.ipcRenderer.on('login', (msg: any, ...args: any) => {
            console.log('loggedin', msg, args);
            dispatch(createMessageAction(msg, true));

            let param = '';
            console.log('ipcRenderer/login', args);
            if (Array.isArray(args)) {
                console.log(`ipcRenderer/login parsed`, args[1]);
                param = args[1];
            } else if (args.split(',').length > 1) {
                console.log(
                    `ipcRenderer/login split`,
                    args
                        .split(',')
                        .map((s: string) => s.trim())
                        .map((ss: string) => `"${ss}"`)
                );
                param = args.split(',').map((s: string) => s.trim())[1];
            } else {
                console.log(`ipcRenderer/login unparsed`, args);
                param = args;
            }

            if (param.length > 0) {
                dispatch(setLaunchUrl(param));
            }
        });

        window.electron.ipcRenderer.on('wallet', (url) => {
            const urlProps = new URL(url as string);
            const pathname = urlProps.pathname.slice(2);
            const { searchParams } = urlProps;

            try {
                if (searchParams.has('type') && searchParams.get('type') === 'tzip10') {
                    const beaconRequest = searchParams.get('data') || '';

                    if (config.beaconEnable) {
                        // dispatch(setModalValue(JSON.parse(base58check.decode(beaconRequest)), 'beaconRegistration'));
                        dispatch(setModalOpen(true, 'beaconRegistration'));
                    } else {
                        // dispatch(setModalValue(JSON.parse(base58check.decode(beaconRequest)), 'beaconDisable'));
                        dispatch(setModalOpen(true, 'beaconDisable'));
                    }

                    // app.focus();
                } else if (['sign', 'beaconRegistration', 'beaconEvent'].includes(pathname) && searchParams.has('r')) {
                    const req = searchParams.get('r') || '';
                    dispatch(setModalValue(JSON.parse(Buffer.from(req, 'base64').toString('utf8')), pathname));

                    if (pathname === 'sign') {
                        dispatch(setModalActiveTab(pathname));
                        dispatch(setModalOpen(true, pathname));
                    } else if (config.beaconEnable) {
                        dispatch(setModalOpen(true, pathname));
                    } else if (!config.beaconEnable) {
                        dispatch(setModalValue({}, pathname));
                        dispatch(setModalValue(JSON.parse(Buffer.from(req, 'base64').toString('utf8')), 'beaconDisable'));
                        dispatch(setModalOpen(true, 'beaconDisable'));
                    }

                    // app.focus();
                }
            } catch (err) {
                console.log('error processing beacon request', err, searchParams);
            }
        });

        const onGetWalletSettings = async () => {
            try {
                const walletSettings = getWalletSettings();
                console.log('walletsettings', walletSettings);
                dispatch({ type: 'INIT_SETTINGS', settings: walletSettings });
            } catch (err) {
                window.setTimeout(() => {
                    navigate('/walletNodesRequired', { replace: true });
                });
                console.error('load setting error', err);
            }
        };

        // resetAllLocalData()

        onGetWalletSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Container>
            <TopBar walletName={walletName} isLoggedIn={isLoggedIn} isExtended={!!newVersion} />
            {newVersion && <VersionStatus version={newVersion} />}
            {element}
            <MessageBar />
            {isLoading && <Loader />}
        </Container>
    );
};

export default App;
