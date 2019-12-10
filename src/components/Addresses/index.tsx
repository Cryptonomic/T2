import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { ms } from '../../styles/helpers';

import AddressBlock from '../AddressBlock';
import { sortArr } from '../../utils/array';
import { RootState } from '../../types/store';

const Container = styled.aside`
  width: 30%;
  max-width: 320px;
  flex-shrink: 0;
  padding: 0 ${ms(3)} 0 0;
`;

const AccountItem = styled.div`
  margin: 0 0 ${ms(1)} 0;
`;

interface Props {
  identities: any[];
}

function Addresses(props: Props) {
  const { identities } = props;
  return (
    <Container>
      {identities
        .sort(sortArr({ sortOrder: 'asc', sortBy: 'order' }))
        .map((accountBlock, index) => (
          <AccountItem key={index}>
            <AddressBlock accountBlock={accountBlock} accountIndex={index + 1} />
          </AccountItem>
        ))}
    </Container>
  );
}

const mapStateToProps = (state: RootState) => ({
  identities: state.wallet.identities
});

export default connect(
  mapStateToProps,
  null
)(Addresses);
