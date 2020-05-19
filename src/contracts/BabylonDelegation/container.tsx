import React, { Fragment, useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import styled from 'styled-components';
import { lighten } from 'polished';
import { useTranslation } from 'react-i18next';

import Button from '../../components/Button';
import BalanceBanner from '../../components/BalanceBanner';
import EmptyState from '../../components/EmptyState';
import PageNumbers from '../../components/PageNumbers';
import Transactions from './components/Transactions';

import Loader from '../../components/Loader';
import AccountStatus from '../../components/AccountStatus';

import Delegate from './components/Delegate';
import Send from './components/Send';
import Deposit from './components/Deposit';
import Withdraw from './components/Withdraw';
import { TRANSACTIONS, SEND, DELEGATE, DEPOSIT, WITHDRAW } from '../../constants/TabConstants';
import { READY } from '../../constants/StatusTypes';
import { ms } from '../../styles/helpers';
import transactionsEmptyState from '../../../resources/transactionsEmptyState.svg';

import { sortArr } from '../../utils/array';
import { isReady } from '../../utils/general';

import { RootState } from '../../types/store';

import { updateActiveTabThunk } from '../../reduxContent/wallet/thunks';
import { getAccountSelector } from '../duck/selectors';

const Container = styled.section`
    flex-grow: 1;
`;

const Tab = styled(Button)<{ isActive: boolean; ready: boolean }>`
    background: ${({ isActive, theme: { colors } }) => (isActive ? colors.white : colors.accent)};
    color: ${({ isActive, theme: { colors } }) => (isActive ? colors.primary : lighten(0.4, colors.accent))};
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
    padding: ${ms(2)};
    min-height: 400px;
`;

const tabs = [TRANSACTIONS, SEND, DELEGATE, WITHDRAW, DEPOSIT];

function ActionPanel() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [currentPage, setCurrentPage] = useState(1);
    const selectedAccount = useSelector(getAccountSelector);

    const { isLoading, selectedParentHash, selectedAccountHash } = useSelector((rootState: RootState) => rootState.app, shallowEqual);

    const { balance, activeTab, storeType, status, delegate_value, regularAddresses, transactions } = selectedAccount;

    function onChangeTab(newTab: string) {
        dispatch(updateActiveTabThunk(newTab));
    }

    function renderSection() {
        const ready = status === READY;
        switch (activeTab) {
            case DELEGATE:
                return <Delegate isReady={ready} />;
            case SEND:
                return <Send isReady={ready} addressBalance={balance} />;
            case WITHDRAW:
                return <Withdraw balance={balance} isReady={ready} onSuccess={() => onChangeTab(TRANSACTIONS)} />;
            case DEPOSIT:
                return <Deposit isReady={ready} addresses={regularAddresses} onSuccess={() => onChangeTab(TRANSACTIONS)} />;
            case TRANSACTIONS:
            default: {
                if (!ready) {
                    return <AccountStatus address={selectedAccount} />;
                }

                const JSTransactions = transactions.sort(sortArr({ sortOrder: 'desc', sortBy: 'timestamp' }));
                const itemsCount = 5;
                const pageCount = Math.ceil(JSTransactions.length / itemsCount);

                const firstNumber = (currentPage - 1) * itemsCount;
                let lastNumber = currentPage * itemsCount;
                if (lastNumber > JSTransactions.length) {
                    lastNumber = JSTransactions.length;
                }
                const showedTransactions = JSTransactions.slice(firstNumber, lastNumber);
                return transactions.length === 0 ? (
                    <EmptyState imageSrc={transactionsEmptyState} title={t('components.actionPanel.empty-title')} description={null} />
                ) : (
                    <Fragment>
                        <Transactions transactions={showedTransactions} selectedAccountHash={selectedAccountHash} selectedParentHash={selectedParentHash} />
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
                secretKey={''}
                publicKeyHash={selectedAccountHash || 'Inactive'}
                delegatedAddress={delegate_value}
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

export default ActionPanel;
