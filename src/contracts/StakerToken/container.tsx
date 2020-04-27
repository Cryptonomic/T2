import React, { Fragment, useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { Container, TabList, Tab, TabText, SectionContainer } from './style';

import BalanceBanner from './components/BalanceBanner';
import EmptyState from '../../components/EmptyState';
import PageNumbers from '../../components/PageNumbers';
import Transactions from './components/Transactions';
import Details from './components/Details';

import Loader from '../../components/Loader';

import { TRANSACTIONS, DETAILS } from '../../constants/TabConstants';
import { READY } from '../../constants/StatusTypes';
import transactionsEmptyState from '../../../resources/transactionsEmptyState.svg';

import { sortArr } from '../../utils/array';

import { RootState } from '../../types/store';

import { updateActiveTabThunk } from '../../reduxContent/wallet/thunks';
import { getTokenSelector } from '../duck/selectors';

const tabs = [DETAILS];

function ActionPanel() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [currentPage, setCurrentPage] = useState(1);
    const selectedToken = useSelector(getTokenSelector);

    const { isLoading, selectedParentHash, selectedAccountHash } = useSelector((rootState: RootState) => rootState.app, shallowEqual);

    const { balance, activeTab, symbol, displayName, details, transactions } = selectedToken;

    function onChangeTab(newTab: string) {
        dispatch(updateActiveTabThunk(newTab, true));
    }

    function renderSection() {
        const ready = status === READY;
        switch (activeTab) {
            case DETAILS:
                return <Details pkh={selectedAccountHash} details={details} />;
            case TRANSACTIONS:
            default: {
                if (!transactions || transactions.length === 0) {
                    return <EmptyState imageSrc={transactionsEmptyState} title={t('components.actionPanel.empty-title')} description={null} />;
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

                return (
                    <Fragment>
                        <Transactions transactions={showedTransactions} selectedParentHash={selectedParentHash} symbol={symbol} />
                        {pageCount > 1 && (
                            <PageNumbers
                                currentPage={currentPage}
                                totalNumber={showedTransactions.length}
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
            <BalanceBanner isReady={true} balance={balance || 0} publicKeyHash={selectedAccountHash || 'Inactive'} displayName={displayName} symbol={symbol} />

            <TabList count={tabs.length}>
                {tabs.map(tab => (
                    <Tab isActive={activeTab === tab} key={tab} ready={true} buttonTheme="plain" onClick={() => onChangeTab(tab)}>
                        <TabText ready={true}>{t(tab)}</TabText>
                    </Tab>
                ))}
            </TabList>
            <SectionContainer>{renderSection()}</SectionContainer>
        </Container>
    );
}

export default ActionPanel;
