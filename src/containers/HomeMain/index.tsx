const { ipcRenderer } = require('electron');
import React, { useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import { RootState } from '../../types/store';
import { AddressType } from '../../types/general';

import { BeaconMessageRouter } from '../../featureModals/Beacon/BeaconMessageRouter';
import { setLaunchUrl } from '../../reduxContent/app/actions';
import AddressBlock from '../../components/AddressBlock';
import BabylonDelegation from '../../contracts/BabylonDelegation';
import GenericContract from '../../contracts/GenericContract';
import TokenContract from '../../contracts/TokenContract';
import ImplicitAccount from '../../contracts/ImplicitAccount';
import TzBtcToken from '../../contracts/TzBtcToken';
import WXTZToken from '../../contracts/WrappedTezos';
import KolibriToken from '../../contracts/KolibriToken';
import HicNFT from '../../contracts/HicNFT';
import BlndToken from '../../contracts/BlndToken';
import StkrToken from '../../contracts/StkrToken';
import TokensPage from '../TokensPage';

import { sortArr } from '../../utils/array';

import { Container, SideBarContainer, AccountItem } from './style';

function HomeMain() {
    const dispatch = useDispatch();

    const identities = useSelector((state: RootState) => state.wallet.identities, shallowEqual);
    const addressType = useSelector((state: RootState) => state.app.selectedAccountType);
    const launchUrl = useSelector((state: RootState) => state.app.launchUrl);

    useEffect(() => {
        console.log('HomeMain', launchUrl);
        if (launchUrl) {
            ipcRenderer.send('wallet', launchUrl);
            dispatch(setLaunchUrl(''));
        }
    }, []);

    function renderView() {
        switch (addressType) {
            case AddressType.Manager:
                return <ImplicitAccount />;
            case AddressType.Delegated:
                return <BabylonDelegation />;
            case AddressType.Token:
                return <TokenContract />;
            case AddressType.TzBTC:
                return <TzBtcToken />;
            case AddressType.wXTZ:
                return <WXTZToken />;
            case AddressType.kUSD:
                return <KolibriToken />;
            case AddressType.objkt:
                return <HicNFT />;
            case AddressType.BLND:
                return <BlndToken />;
            case AddressType.STKR:
                return <StkrToken />;
            case AddressType.TokensPage:
                return <TokensPage />;
            default:
                return <GenericContract />;
        }
    }

    return (
        <Container>
            <BeaconMessageRouter />
            <SideBarContainer>
                {identities.sort(sortArr({ sortOrder: 'asc', sortBy: 'order' })).map((accountBlock, index) => (
                    <AccountItem key={index}>
                        <AddressBlock accountBlock={accountBlock} identityIndex={index} />
                    </AccountItem>
                ))}
            </SideBarContainer>
            {renderView()}
        </Container>
    );
}

export default HomeMain;
