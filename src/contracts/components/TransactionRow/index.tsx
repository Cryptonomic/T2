import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { ms } from '../../../styles/helpers';
import TezosAddress from '../../../components/TezosAddress';
import AmountView from '../../../components/AmountView';
import { openBlockExplorerForOperation } from '../../../utils/general';
import { READY } from '../../../constants/StatusTypes';
import { RootState, SettingsState } from '../../../types/store';
import { getMainNode } from '../../../utils/settings';
import { Node, Token, TokenTransaction } from '../../../types/general';

import { AmountContainer, TransactionContainer, Container, ContentDiv, StateIcon, LinkIcon, StateText, TransactionDate, Fee, Header } from './style';

interface Props {
    transaction: TokenTransaction;
    selectedParentHash: string;
    token: Token;
}

const openLink = (element, nodesList: Node[], selectedNode: string) => {
    const currentNode = getMainNode(nodesList, selectedNode);

    return openBlockExplorerForOperation(element, currentNode.network);
};

const timeFormatter = timestamp => {
    const time = new Date(timestamp);
    return moment(time).format('LT');
};

const getStatus = (transaction, selectedParentHash, t) => {
    const isFee = !!transaction.fee;
    const isAmount = !!transaction.amount;

    if (transaction.source === selectedParentHash && !transaction.entryPoint) {
        // TODO: need a better way to id non-transfer calls
        return {
            icon: 'send',
            preposition: t('general.to'),
            state: t('components.transaction.sent'),
            isFee,
            color: isAmount ? 'error1' : 'gray8',
            sign: isAmount ? '-' : ''
        };
    } else if (transaction.destination === selectedParentHash && !transaction.entryPoint) {
        return {
            icon: 'receive',
            preposition: t('general.from'),
            state: t('components.transaction.received'),
            isFee,
            color: isAmount ? 'check' : 'gray8',
            sign: isAmount ? '+' : ''
        };
    } else {
        return {
            icon: 'star',
            preposition: '',
            state: t('components.transaction.invoked'),
            isFee,
            color: 'gray0',
            sign: ''
        };
    }
};

const getAddress = (transaction, selectedParentHash) => {
    const address = transaction.source === selectedParentHash ? transaction.destination : transaction.source;
    return <TezosAddress address={address} size="14px" weight={200} color="black2" />;
};

function Transaction(props: Props) {
    const { transaction, selectedParentHash, token } = props;
    const { t } = useTranslation();
    const fee = transaction.fee ? transaction.fee : 0;
    const { icon, preposition, state, isFee, color, sign } = getStatus(transaction, selectedParentHash, t);
    const { selectedNode, nodesList } = useSelector<RootState, SettingsState>(rootstate => rootstate.settings, shallowEqual);
    const address = getAddress(transaction, selectedParentHash);

    return (
        <TransactionContainer>
            <Header>
                <TransactionDate>{transaction.status === READY ? timeFormatter(transaction.timestamp) : t('components.transaction.pending')}</TransactionDate>
                <AmountContainer color={color}>
                    {sign}
                    <AmountView
                        color={color}
                        size={ms(-1)}
                        amount={transaction.amount}
                        scale={token.scale}
                        precision={token.precision}
                        round={token.round}
                        symbol={token.symbol}
                    />
                </AmountContainer>
            </Header>
            <Container>
                <ContentDiv>
                    <StateIcon iconName={icon} size={ms(-2)} color="accent" />
                    <StateText>
                        {state}
                        {address ? <span>{preposition}</span> : null}
                    </StateText>
                    {transaction.entryPoint ? (
                        <span>
                            {transaction.entryPoint} of {address}
                        </span>
                    ) : (
                        address
                    )}
                    <LinkIcon
                        iconName="new-window"
                        size={ms(0)}
                        color="primary"
                        onClick={() => openLink(transaction.operation_group_hash, nodesList, selectedNode)}
                    />
                </ContentDiv>

                {isFee && (
                    <Fee>
                        <span>{t('general.nouns.fee')}: </span>
                        <AmountView color="gray5" size={ms(-2)} amount={fee} precision={6} round={6} />
                    </Fee>
                )}
            </Container>
        </TransactionContainer>
    );
}

export default Transaction;
