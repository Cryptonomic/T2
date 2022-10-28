import React from 'react';
import moment from 'moment';

import TransactionsLabel from '../../../components/TransactionsLabel';
import Transaction from '../TransactionRow';
import { Container, SectionContainer } from './style';
import { Props } from './types';

const TransactionContainer = (props: Props) => {
    const { transactions, selectedParentHash, token } = props;

    const transactionsByDate = transactions.reduce((acc, curr) => {
        const date = moment(curr.timestamp).format('LL');
        acc[date] = [...(acc[date] || []), curr];
        return acc;
    }, {});

    return (
        <Container>
            {Object.keys(transactionsByDate).map((day, indexParent) => (
                <SectionContainer key={indexParent}>
                    <TransactionsLabel date={day} skipFormat={true} />
                    {transactionsByDate[day].map((transaction, indexChild) => {
                        return <Transaction key={indexChild} transaction={transaction} selectedParentHash={selectedParentHash} token={token} />;
                    })}
                </SectionContainer>
            ))}
        </Container>
    );
};

export default TransactionContainer;
