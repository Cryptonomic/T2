import React, { Fragment, useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';

import transactionsEmptyState from '../../../resources/transactionsEmptyState.svg';

import BalanceBanner from './components/BalanceBanner';
import EmptyState from '../../components/EmptyState';
import PageNumbers from '../../components/PageNumbers';
import Loader from '../../components/Loader';
import { TRANSACTIONS, SEND, SWAP } from '../../constants/TabConstants';
import { RootState } from '../../types/store';
import { updateActiveTabThunk } from '../../reduxContent/wallet/thunks';

import Transactions from '../components/TransactionContainer';
import Send from '../components/Send';
import Swap from './components/Swap';
import { Container, Tab, TabList, TabText, SectionContainer } from '../components/TabContainer/style';
import { getTokenSelector } from '../duck/selectors';

import { transferThunk } from './thunks';

function ActionPanel() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [currentPage, setCurrentPage] = useState(1);

    const selectedToken = useSelector(getTokenSelector);
    const { isLoading, selectedParentHash, selectedAccountHash } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
    const { displayName, transactions } = selectedToken;
    let { activeTab } = selectedToken;
    if (activeTab === TRANSACTIONS) {
        activeTab = SEND;
    }

    const tabs = [SEND, SWAP];

    function onChangeTab(newTab: string) {
        dispatch(updateActiveTabThunk(newTab, true));
    }

    function renderSection() {
        switch (activeTab) {
            case SEND:
                return <Send isReady={true} token={selectedToken} tokenTransferAction={transferThunk} />;
            case SWAP:
                return <Swap isReady={true} token={selectedToken} />;
            case TRANSACTIONS:
            default: {
                if (!transactions || transactions.length === 0) {
                    return <EmptyState imageSrc={transactionsEmptyState} title={t('components.actionPanel.empty-title')} description={null} />;
                }

                const processedTransactions = transactions.sort((a, b) => b.timestamp - a.timestamp).filter((e) => e);
                const itemsCount = 5;
                const pageCount = Math.ceil(processedTransactions.length / itemsCount);

                const firstNumber = (currentPage - 1) * itemsCount;
                const lastNumber = Math.min(currentPage * itemsCount, processedTransactions.length);

                const transactionSlice = processedTransactions.slice(firstNumber, lastNumber);

                return (
                    <>
                        <Transactions transactions={transactionSlice} selectedParentHash={selectedParentHash} token={selectedToken} />
                        {pageCount > 1 && (
                            <PageNumbers
                                currentPage={currentPage}
                                totalNumber={processedTransactions.length}
                                firstNumber={firstNumber}
                                lastNumber={lastNumber}
                                onClick={(val) => setCurrentPage(val)}
                            />
                        )}
                        {isLoading && <Loader />}
                    </>
                );
            }
        }
    }

    return (
        <Container>
            <BalanceBanner
                isReady={true}
                balance={selectedToken.balance}
                publicKeyHash={selectedAccountHash || 'Inactive'}
                displayName={displayName}
                token={selectedToken}
            />

            <TabList count={tabs.length}>
                {tabs.map((tab) => (
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
