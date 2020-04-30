import React, { Fragment, useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';

import transactionsEmptyState from '../../../resources/transactionsEmptyState.svg';

import EmptyState from '../../components/EmptyState';
import PageNumbers from '../../components/PageNumbers';
import Loader from '../../components/Loader';
import { TRANSACTIONS, DETAILS } from '../../constants/TabConstants';
import { sortArr } from '../../utils/array';
import { RootState } from '../../types/store';
import { updateActiveTabThunk } from '../../reduxContent/wallet/thunks';

import { getTokenSelector } from '../duck/selectors';
import TransactionContainer from '../components/TransactionContainer';

import { Container, Tab, TabList, TabText, SectionContainer } from '../components/TabContainer/style';
import BalanceBanner from '../components/BalanceBanner';
import Details from './components/Details';

const tabs = [DETAILS];

function ActionPanel() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [currentPage, setCurrentPage] = useState(1);
    const selectedToken = useSelector(getTokenSelector);

    const { isLoading, selectedParentHash, selectedAccountHash } = useSelector((rootState: RootState) => rootState.app, shallowEqual);

    const { balance, activeTab, displayName, details, transactions } = selectedToken;

    function onChangeTab(newTab: string) {
        dispatch(updateActiveTabThunk(newTab, true));
    }

    function renderSection() {
        switch (activeTab) {
            case TRANSACTIONS: {
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
                        <TransactionContainer transactions={showedTransactions} selectedParentHash={selectedParentHash} token={selectedToken} />
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
            case DETAILS:
            default:
                return <Details pkh={selectedAccountHash} details={details} />;
        }
    }
    return (
        <Container>
            <BalanceBanner
                isReady={true}
                balance={balance || 0}
                publicKeyHash={selectedAccountHash || 'Inactive'}
                displayName={displayName}
                token={selectedToken}
            />

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
