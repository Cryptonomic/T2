import React, { useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { RootState } from '../../types/store';
import { AddressType } from '../../types/general';

import AddressBlock from '../../components/AddressBlock';
import BabylonDelegation from '../../contracts/BabylonDelegation';
import GenericContract from '../../contracts/GenericContract';
import TokenContract from '../../contracts/TokenContract';
import ImplicitAccount from '../../contracts/ImplicitAccount';
import StakerToken from '../../contracts/StakerToken';
import TzBtcToken from '../../contracts/TzBtcToken';
import { initBeaconThunk } from '../../reduxContent/app/thunks';
import { sortArr } from '../../utils/array';

import { Container, SideBarContainer, AccountItem } from './style';

function HomeMain() {
    const identities = useSelector((state: RootState) => state.wallet.identities, shallowEqual);
    const addressType = useSelector((state: RootState) => state.app.selectedAccountType);
    const signer = useSelector((state: RootState) => state.app.signer); // use Signer
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(initBeaconThunk());
    }, []);

    function renderView() {
        switch (addressType) {
            case AddressType.Manager:
                return <ImplicitAccount />;
            case AddressType.Delegated:
                return <BabylonDelegation />;
            case AddressType.Token:
                return <TokenContract />;
            case AddressType.STKR:
                return <StakerToken />;
            case AddressType.TzBTC:
                return <TzBtcToken />;
            default:
                return <GenericContract />;
        }
    }

    return (
        <Container>
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
