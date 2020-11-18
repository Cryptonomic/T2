import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { RootState } from '../../types/store';
import { AddressType } from '../../types/general';

import AddressBlock from '../../components/AddressBlock';
import BabylonDelegation from '../../contracts/BabylonDelegation';
import GenericContract from '../../contracts/GenericContract';
import TokenContract from '../../contracts/TokenContract';
import ImplicitAccount from '../../contracts/ImplicitAccount';
import StakerToken from '../../contracts/StakerToken';
import TzBtcToken from '../../contracts/TzBtcToken';
import ChainlinkToken from '../../contracts/TezosChainlink';

import { sortArr } from '../../utils/array';
import { Container, SideBarContainer, AccountItem } from './style';

function HomeMain() {
    const identities = useSelector((state: RootState) => state.wallet.identities, shallowEqual);
    const addressType = useSelector((state: RootState) => state.app.selectedAccountType);
    const signer = useSelector((state: RootState) => state.app.signer); // use Signer
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
            case AddressType.TzCl:
                return <ChainlinkToken />;
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
