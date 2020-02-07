import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../types/store';

import AddressBlock from '../../components/AddressBlock';
import { BabylonDelegation } from '../../contracts/BabylonDelegation';

import { sortArr } from '../../utils/array';
import { Container, SideBarContainer, AccountItem } from './style';

function HomeMain() {
  const identities = useSelector((state: RootState) => state.wallet.identities);
  return (
    <Container>
      <SideBarContainer>
        {identities
          .sort(sortArr({ sortOrder: 'asc', sortBy: 'order' }))
          .map((accountBlock, index) => (
            <AccountItem key={index}>
              <AddressBlock accountBlock={accountBlock} identityIndex={index} />
            </AccountItem>
          ))}
      </SideBarContainer>
      <BabylonDelegation />
    </Container>
  );
}

export default HomeMain;
