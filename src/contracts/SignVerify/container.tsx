import React from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import styled from 'styled-components';
import { lighten } from 'polished';
import { useTranslation } from 'react-i18next';

import Button from '../../components/Button';
import BalanceBanner from '../../components/BalanceBanner';
import Sign from './components/Sign';
import Verify from './components/Verify';

import { SIGN, VERIFY } from '../../constants/TabConstants';
import { ms } from '../../styles/helpers';

import { isReady } from '../../utils/general';

import { RootState } from '../../types/store';

import { updateActiveTabThunk } from '../../reduxContent/wallet/thunks';
import { getAccountSelector } from '../duck/selectors';

const Container = styled.section`
  flex-grow: 1;
  overflow: hidden;
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
  padding: ${ms(2)};
  min-height: 400px;
`;

const tabs = [SIGN, VERIFY];

function ActionPanel() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const selectedAccount = useSelector(getAccountSelector);

  const { selectedAccountHash } = useSelector(
    (rootState: RootState) => rootState.app,
    shallowEqual
  );

  const {
    balance,
    activeTab,
    storeType,
    status,
    script,
    privateKey,
    delegate_value,
    storage
  } = selectedAccount;

  function onChangeTab(newTab: string) {
    dispatch(updateActiveTabThunk(newTab));
  }

  function renderSection() {
    switch (activeTab) {
      case VERIFY:
        return <Verify />;
      case SIGN:
      default:
        return <Sign />;
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
