import React, { Fragment, useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { Container, TabList, Tab, TabText, SectionContainer } from './style';

import BalanceBanner from './BalanceBanner';
import EmptyState from '../../components/EmptyState';
import PageNumbers from '../../components/PageNumbers';
import Transactions from './TransactionsContainer';

import Loader from '../../components/Loader';
import AccountStatus from '../../components/AccountStatus';

import { TRANSACTIONS } from '../../constants/TabConstants';
import { READY } from '../../constants/StatusTypes';
import transactionsEmptyState from '../../../resources/transactionsEmptyState.svg';

import { sortArr } from '../../utils/array';
import { isReady } from '../../utils/general';

import { RootState } from '../../types/store';

import { updateActiveTabThunk } from '../../reduxContent/wallet/thunks';
import { getAccountSelector } from '../duck/selectors';

const tabs = [TRANSACTIONS];

function ActionPanel() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [currentPage, setCurrentPage] = useState(1);
    const selectedAccount = useSelector(getAccountSelector);

    const { isLoading, selectedParentHash, selectedAccountHash } = useSelector((rootState: RootState) => rootState.app, shallowEqual);

    const { balance, activeTab, storeType, status, delegate_value, transactions } = selectedAccount;

    function onChangeTab(newTab: string) {
        dispatch(updateActiveTabThunk(newTab));
    }

    function renderSection() {
        const ready = status === READY;
        switch (activeTab) {
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
                publicKeyHash={selectedAccountHash || 'Inactive'}
                delegatedAddress={delegate_value}
                displayName="StakerDAO Token"
                symbol="STKR"
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
