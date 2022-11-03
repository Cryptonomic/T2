import React from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';

import transactionsEmptyState from '../../../resources/transactionsEmptyState.svg';

import PaginationList from '../../components/PaginationList';
import { TRANSACTIONS, SEND, VAULTS } from '../../constants/TabConstants';
import { RootState } from '../../types/store';
import { updateActiveTabThunk } from '../../reduxContent/wallet/thunks';

import BalanceBanner from '../components/BalanceBanner';
import Transactions from '../components/TransactionContainer';
import Send from '../components/Send';
import { Container, Tab, TabList, TabText, SectionContainer } from '../components/TabContainer/style';
import { getTokenSelector } from '../duck/selectors';
import { transferThunk } from './thunks';

const ActionPanel = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const selectedToken = useSelector(getTokenSelector);
    const { selectedParentHash, selectedAccountHash } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
    // const { activeTab, displayName, transactions, vaultList } = selectedToken as VaultToken;
    const { activeTab, displayName, transactions } = selectedToken;
    const tabs = [TRANSACTIONS, SEND /* , VAULTS */];
    const transactionList = transactions.filter((e) => e).sort((a, b) => b.timestamp - a.timestamp);

    // TODO(keefertaylor): Sort ovens in a deterministic way.

    const onChangeTab = (newTab: string) => {
        dispatch(updateActiveTabThunk(newTab, true));
    };

    return (
        <Container>
            <BalanceBanner
                isReady
                balance={selectedToken.balance}
                publicKeyHash={selectedAccountHash || 'Inactive'}
                displayName={displayName}
                token={selectedToken}
            />

            <TabList count={tabs.length}>
                {tabs.map((tab) => (
                    <Tab isActive={activeTab === tab} key={tab} ready buttonTheme="plain" onClick={() => onChangeTab(tab)}>
                        <TabText ready>{t(tab)}</TabText>
                    </Tab>
                ))}
            </TabList>
            <SectionContainer>
                {activeTab === SEND && <Send isReady token={selectedToken} tokenTransferAction={transferThunk} />}
                {activeTab === TRANSACTIONS && (
                    <PaginationList
                        list={transactionList}
                        ListComponent={Transactions}
                        listComponentProps={{ selectedParentHash, token: selectedToken }}
                        componentListName="transactions"
                        emptyState={transactionsEmptyState}
                        emptyStateTitle={t('components.actionPanel.empty-title')}
                    />
                )}
            </SectionContainer>
        </Container>
    );
};

export default ActionPanel;
