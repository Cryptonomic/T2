import React from 'react';
import moment from 'moment';

import styled from 'styled-components';
import TransactionsLabel from '../../../../components/TransactionsLabel';
import Transaction from '../Transaction';

const Container = styled.section`
    height: 100%;
    background-color: ${({ theme: { colors } }) => colors.white};
    display: flex;
    flex-direction: column;
    flex: 1;
`;

const SectionContainer = styled.div``;

interface Props {
    transactions: any[];
    selectedAccountHash: string;
    selectedParentHash: string;
}

export default function Transactions(props: Props) {
    const { transactions, selectedAccountHash, selectedParentHash } = props;

    const transactionsByDate = transactions.reduce((acc, curr) => {
        const date = moment(curr.timestamp).format('LL');
        acc[date] = [].concat(acc[date] || [], curr);
        return acc;
    }, {});

    const renderDayTransactions = (day, grTransactions, grIndex) => (
        <SectionContainer key={grIndex}>
            <TransactionsLabel date={day} skipFormat={true} />
            {grTransactions.map((transaction, index) => {
                return <Transaction key={index} transaction={transaction} selectedAccountHash={selectedAccountHash} selectedParentHash={selectedParentHash} />;
            })}
        </SectionContainer>
    );

    return <Container>{Object.keys(transactionsByDate).map((day, index) => renderDayTransactions(day, transactionsByDate[day], index))}</Container>;
}
