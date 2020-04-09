import React from 'react';
import moment from 'moment';

import styled from 'styled-components';
import TransactionsLabel from '../../../../components/TransactionsLabel';
import Transaction from '../Transaction';
import { TokenTransaction } from '../../../../types/general';

const Container = styled.section`
  height: 100%;
  background-color: ${({ theme: { colors } }) => colors.white};
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const SectionContainer = styled.div``;

interface Props {
  transactions: TokenTransaction[];
  selectedParentHash: string;
  symbol: string;
}

export default function Transactions(props: Props) {
  const { transactions, selectedParentHash, symbol } = props;

  const transactionsByDate = transactions.reduce((acc, curr) => {
    const date = moment(curr.timestamp).format('l');
    acc[date] = [...(acc[date] || []), curr];
    return acc;
  }, {});

  const renderDayTransactions = (day, grTransactions, grIndex) => (
    <SectionContainer key={grIndex}>
      <TransactionsLabel date={new Date(day)} />
      {grTransactions.map((transaction, index) => {
        return (
          <Transaction
            key={index}
            transaction={transaction}
            selectedParentHash={selectedParentHash}
            symbol={symbol}
          />
        );
      })}
    </SectionContainer>
  );

  return (
    <Container>
      {Object.keys(transactionsByDate).map((day, index) =>
        renderDayTransactions(day, transactionsByDate[day], index)
      )}
    </Container>
  );
}
