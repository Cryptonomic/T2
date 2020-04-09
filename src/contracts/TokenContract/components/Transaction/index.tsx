import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import styled from 'styled-components';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { ms } from '../../../../styles/helpers';
import TezosAddress from '../../../../components/TezosAddress';
import TezosAmount from '../../../../components/TezosAmount';
import TezosIcon from '../../../../components/TezosIcon';
import { openLinkToBlockExplorer } from '../../../../utils/general';
import { READY } from '../../../../constants/StatusTypes';

import { RootState, SettingsState } from '../../../../types/store';
import { getMainNode } from '../../../../utils/settings';
import { Node, TokenTransaction } from '../../../../types/general';

const AmountContainer = styled.div<{ color: string }>`
  color: ${({ theme: { colors }, color }) => colors[color]};
  font-size: ${ms(-1)};
`;
const TransactionContainer = styled.div`
  padding: 8px 25px 17px 25px;
  border-bottom: solid 1px ${({ theme: { colors } }) => colors.gray7};
  &:last-child {
    border: none;
  }
`;
const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const ContentDiv = styled.div`
  display: flex;
  align-items: baseline;
  line-height: 14px;
  flex: 1;
`;
const StateIcon = styled(TezosIcon)`
  margin-right: 5px;
`;
const LinkIcon = styled(TezosIcon)`
  margin-left: 6px;
  cursor: pointer;
`;
const StateText = styled.div`
  font-size: 10px;
  color: ${({ theme: { colors } }) => colors.accent};
  span {
    font-size: 12px;
    color: ${({ theme: { colors } }) => colors.gray6};
    margin: 0 6px;
  }
`;

const TransactionDate = styled.div`
  color: ${({ theme: { colors } }) => colors.gray5};
`;

const Fee = styled.div`
  font-size: ${ms(-2)};
  color: ${({ theme: { colors } }) => colors.gray5};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${({ theme: { colors } }) => colors.gray5};
  font-size: 12px;
  line-height: 30px;
`;

const openLink = (element, nodesList: Node[], selectedNode: string) => {
  const currentNode = getMainNode(nodesList, selectedNode);

  return openLinkToBlockExplorer(element, currentNode.network);
};

const timeFormatter = timestamp => {
  const time = new Date(timestamp);
  return moment(time).format('LT');
};

const getStatus = (transaction, selectedParentHash, t) => {
  const isSameLocation = transaction.source === selectedParentHash;
  const isFee = !!transaction.fee;
  const isAmount = !!transaction.amount;
  if (isSameLocation) {
    return {
      icon: 'send',
      preposition: t('general.to'),
      state: t('components.transaction.sent'),
      isFee,
      color: isAmount ? 'error1' : 'gray8',
      sign: isAmount ? '-' : ''
    };
  } else {
    return {
      icon: 'receive',
      preposition: t('general.from'),
      state: t('components.transaction.received'),
      isFee: false,
      color: isAmount ? 'check' : 'gray8',
      sign: isAmount ? '+' : ''
    };
  }
};

const getAddress = (transaction, selectedParentHash) => {
  const address =
    transaction.source === selectedParentHash ? transaction.destination : transaction.source;
  return <TezosAddress address={address} size="14px" weight={200} color="black2" />;
};

interface Props {
  transaction: TokenTransaction;
  selectedParentHash: string;
  symbol: string;
}

function Transaction(props: Props) {
  const { transaction, selectedParentHash, symbol } = props;
  const { t } = useTranslation();
  const fee = transaction.fee ? transaction.fee : 0;
  const { icon, preposition, state, isFee, color, sign } = getStatus(
    transaction,
    selectedParentHash,
    t
  );
  const { selectedNode, nodesList } = useSelector<RootState, SettingsState>(
    rootstate => rootstate.settings,
    shallowEqual
  );
  const address = getAddress(transaction, selectedParentHash);

  return (
    <TransactionContainer>
      <Header>
        <TransactionDate>
          {transaction.status === READY
            ? timeFormatter(transaction.timestamp)
            : t('components.transaction.pending')}
        </TransactionDate>
        <AmountContainer color={color}>
          {sign}
          <TezosAmount
            color={color}
            size={ms(-1)}
            amount={transaction.amount}
            format={6}
            symbol={symbol}
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
          {address}
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
            <TezosAmount color="gray5" size={ms(-2)} amount={fee} format={6} />
          </Fee>
        )}
      </Container>
    </TransactionContainer>
  );
}

export default Transaction;
