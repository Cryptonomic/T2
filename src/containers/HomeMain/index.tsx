import React, { useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { ms } from '../../styles/helpers';

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
              <AddressBlock accountBlock={accountBlock} accountIndex={index + 1} />
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

export default connect(
  mapStateToProps,
  null
)(HomeMain);
