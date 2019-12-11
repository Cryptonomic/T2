import React from 'react';
import styled from 'styled-components';
import moment from 'moment';

const TodayYesterdayFormat = {
  lastDay: '[Yesterday]',
  sameDay: '[Today]'
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
  date: string;
}

function TransactionsLabel(props: Props) {
  const { date } = props;
  const isToday = moment(date).isBetween(moment().subtract(2, 'days'), moment());
  const time = isToday
    ? moment(date).calendar(undefined, TodayYesterdayFormat)
    : moment(date).format('MMMM DD');
  return (
    <DateContainer>
      <TransactionsDate>{time}</TransactionsDate>
    </DateContainer>
  );
}

export default TransactionsLabel;
