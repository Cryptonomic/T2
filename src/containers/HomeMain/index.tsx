import React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../../types/store';

import AddressBlock from '../../components/AddressBlock';
import ActionPanel from '../../components/ActionPanel';

import { sortArr } from '../../utils/array';
import { Container, SideBarContainer, AccountItem } from './style';

interface Props {
  identities: any[];
}

function HomeMain(props: Props) {
  const { identities } = props;
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
      <ActionPanel />
    </Container>
  );
}

const mapStateToProps = (state: RootState) => ({
  identities: state.wallet.identities
});

export default connect(mapStateToProps, null)(HomeMain);
