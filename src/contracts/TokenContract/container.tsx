import React, { Fragment, useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import styled from 'styled-components';
import { lighten } from 'polished';
import { useTranslation, Trans } from 'react-i18next';

import Button from '../../components/Button';
import BalanceBanner from '../../components/BalanceBanner';
import EmptyState from '../../components/EmptyState';
import PageNumbers from '../../components/PageNumbers';
import Transactions from '../../components/Transactions';

import Loader from '../../components/Loader';

import Send from './components/Send';
import Burn from './components/Burn';
import Mint from './components/Mint';

import { TRANSACTIONS, SEND, BURN, MINT } from '../../constants/TabConstants';
import { ms } from '../../styles/helpers';
import transactionsEmptyState from '../../../resources/transactionsEmptyState.svg';

import { sortArr } from '../../utils/array';

import { RootState } from '../../types/store';

import { updateActiveTabThunk } from '../../reduxContent/wallet/thunks';
import { getTokenSelector } from './duck/selectors';

const Container = styled.section`
  flex-grow: 1;
`;

const Tab = styled(Button)<{ isActive: boolean; ready: boolean }>`
  background: ${({ isActive, theme: { colors } }) => (isActive ? colors.white : colors.accent)};
  color: ${({ isActive, theme: { colors } }) =>
    isActive ? colors.primary : lighten(0.4, colors.accent)};
  cursor: ${({ ready }) => (ready ? 'pointer' : 'initial')};
  text-align: center;
  font-weight: 500;
  padding: ${ms(-1)} ${ms(1)};
  border-radius: 0;
`;

const TabList = styled.div<{ count: number }>`
  background-color: ${({ theme: { colors } }) => colors.accent};
  display: grid;
  grid-template-columns: ${({ count }) => (count > 4 ? `repeat(${count}, 1fr)` : 'repeat(4, 1fr)')};
  grid-column-gap: 50px;
`;

const TabText = styled.span<{ ready: boolean }>`
  opacity: ${({ ready }) => (ready ? '1' : '0.5')};
`;

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  padding: ${ms(4)};
  min-height: 600px;
`;

function ActionPanel() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const selectedToken = useSelector(getTokenSelector);

  const { isLoading, selectedParentHash, selectedAccountHash } = useSelector(
    (rootState: RootState) => rootState.app,
    shallowEqual
  );

  const { balance, activeTab, symbol, displayName, administrator, transactions } = selectedToken;

  const isAdmin = selectedParentHash === administrator;
  const tabs = isAdmin ? [TRANSACTIONS, SEND, MINT, BURN] : [TRANSACTIONS, SEND];

  function onChangeTab(newTab: string) {
    dispatch(updateActiveTabThunk(newTab, true));
  }

  function renderSection() {
    switch (activeTab) {
      case MINT:
        return <Mint isReady={true} balance={balance} symbol={symbol} />;
      case BURN:
        return <Burn isReady={true} balance={balance} symbol={symbol} />;
      case SEND:
        return <Send isReady={true} balance={balance} symbol={symbol} />;
      case TRANSACTIONS:
      default: {
        if (!transactions || transactions.length === 0) {
          return (
            <EmptyState
              imageSrc={transactionsEmptyState}
              title={t('components.actionPanel.empty-title')}
              description={null}
            />
          );
        }

        const JSTransactions = (transactions || []).sort(
          sortArr({ sortOrder: 'desc', sortBy: 'timestamp' })
        );
        const itemsCount = 5;
        const pageCount = Math.ceil(JSTransactions.length / itemsCount);

        const firstNumber = (currentPage - 1) * itemsCount;
        let lastNumber = currentPage * itemsCount;
        if (lastNumber > JSTransactions.length) {
          lastNumber = JSTransactions.length;
        }
        const showedTransactions = JSTransactions.slice(firstNumber, lastNumber);
        return (
          <Fragment>
            <Transactions
              transactions={showedTransactions}
              selectedAccountHash={selectedAccountHash}
              selectedParentHash={selectedParentHash}
            />
            {pageCount > 1 && (
              <PageNumbers
                currentPage={currentPage}
                totalNumber={JSTransactions.length}
                firstNumber={firstNumber}
                lastNumber={lastNumber}
                onClick={val => setCurrentPage(val)}
              />
            )}
            {isLoading && <Loader />}
          </Fragment>
        );
      }
    }
  }
  return (
    <Container>
      <BalanceBanner
        isReady={true}
        balance={balance || 0}
        privateKey={''}
        publicKeyHash={selectedAccountHash || 'Inactive'}
        delegatedAddress={''}
        displayName={displayName}
        symbol={symbol}
      />

      <TabList count={tabs.length}>
        {tabs.map(tab => (
          <Tab
            isActive={activeTab === tab}
            key={tab}
            ready={true}
            buttonTheme="plain"
            onClick={() => onChangeTab(tab)}
          >
            <TabText ready={true}>{t(tab)}</TabText>
          </Tab>
        ))}
      </TabList>
      <SectionContainer>{renderSection()}</SectionContainer>
    </Container>
  );
}

export default ActionPanel;
