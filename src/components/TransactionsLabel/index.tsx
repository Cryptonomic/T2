import React from 'react';
import styled from 'styled-components';
import moment from 'moment';

const DateFormat = {
  lastDay: '[Yesterday]',
  sameDay: '[Today]',
  sameElse: 'MMMM DD'
};

const DateContainer = styled.div`
  background-color: ${({ theme: { colors } }) => colors.gray1};
  height: 42px;
  display: flex;
  padding: 0 25px;
  align-items: center;
  justify-content: space-between;
`;

const TransactionsDate = styled.div`
  color: ${({ theme: { colors } }) => colors.secondary};
  line-height: 1.63;
  font-weight: 500;
`;

interface Props {
  date: Date;
}

function TransactionsLabel(props: Props) {
  const { date } = props;
  const time = moment(date).calendar(undefined, DateFormat);
  return (
    <DateContainer>
      <TransactionsDate>{time}</TransactionsDate>
    </DateContainer>
  );
}

export default TransactionsLabel;
