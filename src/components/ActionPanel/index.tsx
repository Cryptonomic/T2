import React, { Fragment, useState, useEffect } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { lighten } from 'polished';
import { withTranslation, WithTranslation, Trans } from 'react-i18next';

import Button from '../Button';
import BalanceBanner from '../BalanceBanner';
import EmptyState from '../EmptyState';
import PageNumbers from '../PageNumbers';
import Transactions from '../Transactions';

import Loader from '../Loader';
import AccountStatus from '../AccountStatus';

import { Send, Receive, Invoke, CodeStorage, Withdraw, Deposit, Delegate } from '../TabContents';

import {
  TRANSACTIONS,
  SEND,
  RECEIVE,
  DELEGATE,
  INVOKE,
  CODE,
  STORAGE,
  INVOKE_MANAGER,
  DEPOSIT,
  WITHDRAW
} from '../../constants/TabConstants';
import { ms } from '../../styles/helpers';
import transactionsEmptyState from '../../../resources/transactionsEmptyState.svg';
import { READY } from '../../constants/StatusTypes';
import { sortArr } from '../../utils/array';
import { isReady } from '../../utils/general';
import { getAddressType } from '../../utils/account';

import { RootState } from '../../types/store';
import { AddressType } from '../../types/general';

import { syncWalletThunk, updateActiveTabThunk } from '../../reduxContent/wallet/thunks';
import { getAccountSelector } from '../../reduxContent/app/selectors';

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

const Link = styled.span`
  color: ${({ theme: { colors } }) => colors.blue1};
  cursor: pointer;
`;

const DescriptionContainer = styled.p`
  color: ${({ theme: { colors } }) => colors.gray5};
  text-align: center;
`;

interface DescriptionProps {
  onSendClick: () => void;
  onReceiveClick: () => void;
}

const Description = (props: DescriptionProps) => {
  const { onSendClick, onReceiveClick } = props;
  return (
    <DescriptionContainer>
      <Trans i18nKey="components.actionPanel.description">
        It is pretty empty here. Get started
        <Link onClick={onSendClick}> sending</Link> and
        <Link onClick={onReceiveClick}> receiving</Link> tez from this address.
      </Trans>
    </DescriptionContainer>
  );
};

interface OwnProps {
  updateActiveTab: (activeTab: string) => void;
  selectedAccount: any;
  isLoading: boolean;
  isWalletSyncing: boolean;
  isLedger: boolean;
  syncWallet: () => void;
  selectedAccountHash: string;
  selectedParentHash: string;
  selectedParentIndex: number;
  selectedAccountIndex: number;
  isManager: boolean;
  time: Date;
}

type Props = OwnProps & WithTranslation;

function ActionPanel(props: Props) {
  const {
    t,
    selectedAccount,
    selectedAccountHash,
    selectedParentHash,
    selectedParentIndex,
    selectedAccountIndex,
    isManager,
    time,
    isLedger,
    isWalletSyncing,
    syncWallet,
    isLoading,
    updateActiveTab
  } = props;
  const [currentPage, setCurrentPage] = useState(1);
  const [addressType, setAddressType] = useState(AddressType.Manager);
  const [tabs, setTabs] = useState<string[]>([]);

  const {
    balance,
    activeTab,
    storeType,
    status,
    script,
    privateKey,
    delegate_value,
    regularAddresses,
    transactions,
    storage
  } = selectedAccount;

  useEffect(() => {
    const type = getAddressType(selectedAccountHash, script);
    let mainTabs: string[] = [];
    switch (type) {
      case AddressType.Manager: {
        mainTabs = [TRANSACTIONS, SEND, RECEIVE, DELEGATE];
        break;
      }
      case AddressType.Delegated: {
        mainTabs = [TRANSACTIONS, SEND, DELEGATE, WITHDRAW, DEPOSIT];
        break;
      }
      case AddressType.Smart: {
        mainTabs = [TRANSACTIONS, INVOKE, CODE, STORAGE];
        break;
      }
    }
    setTabs(mainTabs);
    setAddressType(type);
  }, [selectedAccountHash, script]);

  function onChangeTab(newTab: string) {
    updateActiveTab(newTab);
  }

  function renderSection() {
    const ready = status === READY;
    switch (activeTab) {
      case DELEGATE:
        return <Delegate isReady={ready} />;
      case RECEIVE:
        return <Receive address={selectedAccountHash} />;
      case SEND:
        return <Send isReady={ready} addressBalance={balance} />;
      case CODE:
        return <CodeStorage code={script.replace(/\\n/g, '\n')} />;
      case STORAGE:
        return <CodeStorage code={storage} />;
      case INVOKE:
        return (
          <Invoke
            isReady={ready}
            addresses={regularAddresses}
            onSuccess={() => onChangeTab(TRANSACTIONS)}
          />
        );
      // case INVOKE_MANAGER:
      //   return (
      //     <InvokeManager
      //       balance={balance}
      //       isReady={ready}
      //       addresses={regularAddresses}
      //       selectedParentHash={selectedParentHash}
      //       selectedAccountHash={selectedAccountHash}
      //       onSuccess={() => onChangeTab(TRANSACTIONS)}
      //     />
      //   );
      case WITHDRAW:
        return (
          <Withdraw balance={balance} isReady={ready} onSuccess={() => onChangeTab(TRANSACTIONS)} />
        );
      case DEPOSIT:
        return (
          <Deposit
            isReady={ready}
            addresses={regularAddresses}
            onSuccess={() => onChangeTab(TRANSACTIONS)}
          />
        );
      case TRANSACTIONS:
      default: {
        if (!ready) {
          return (
            <AccountStatus address={selectedAccount} isContract={!!script} isManager={isManager} />
          );
        }

        const JSTransactions = transactions.sort(
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
        return transactions.length === 0 ? (
          <EmptyState
            imageSrc={transactionsEmptyState}
            title={t('components.actionPanel.empty-title')}
            description={
              <Description
                onReceiveClick={() => onChangeTab(RECEIVE)}
                onSendClick={() => onChangeTab(SEND)}
              />
            }
          />
        ) : (
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
        storeType={storeType}
        isReady={isReady(status, storeType)}
        balance={balance || 0}
        privateKey={privateKey}
        publicKeyHash={selectedAccountHash || 'Inactive'}
        parentIndex={selectedParentIndex + 1}
        isManager={isManager}
        onRefreshClick={syncWallet}
        time={time}
        delegatedAddress={delegate_value}
        isWalletSyncing={isWalletSyncing}
        addressType={addressType}
        addressIndex={selectedAccountIndex + 1}
        isLedger={isLedger}
      />

      <TabList count={tabs.length}>
        {tabs.map(tab => {
          const ready = isReady(status, storeType, tab);
          return (
            <Tab
              isActive={activeTab === tab}
              key={tab}
              ready={ready}
              buttonTheme="plain"
              onClick={() => {
                if (ready) {
                  onChangeTab(tab);
                }
              }}
            >
              <TabText ready={ready}>{t(tab)}</TabText>
            </Tab>
          );
        })}
      </TabList>
      <SectionContainer>{renderSection()}</SectionContainer>
    </Container>
  );
}

const mapStateToProps = (state: RootState) => ({
  selectedAccount: getAccountSelector(state),
  isLoading: state.app.isLoading,
  time: state.app.time,
  isWalletSyncing: state.app.isWalletSyncing,
  isLedger: state.app.isLedger,
  isManager: state.app.isManager,
  selectedAccountHash: state.app.selectedAccountHash,
  selectedParentIndex: state.app.selectedParentIndex,
  selectedAccountIndex: state.app.selectedAccountIndex
});

const mapDispatchToProps = dispatch => ({
  updateActiveTab: (activeTab: string) => dispatch(updateActiveTabThunk(activeTab)),
  syncWallet: () => dispatch(syncWalletThunk())
});

export default compose(
  withTranslation(),
  connect(mapStateToProps, mapDispatchToProps)
)(ActionPanel) as React.ComponentType<any>;
