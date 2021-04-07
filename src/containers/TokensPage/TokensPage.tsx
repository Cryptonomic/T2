import * as React from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { Container as TopWrapper, TopRow, BottomRow, Breadcrumbs } from '../../components/BalanceBanner/style';
import { Container, SectionContainer } from '../../contracts/components/TabContainer/style';

import Update from '../../components/Update';

import { syncWalletThunk } from '../../reduxContent/wallet/thunks';

import { RootState } from '../../types/store';

const TokensPage = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { time, isWalletSyncing, isLedger, selectedAccountType, selectedAccountIndex, selectedParentIndex } = useSelector(
        (state: RootState) => state.app,
        shallowEqual
    );

    const onSyncWallet = () => dispatch(syncWalletThunk());

    return (
        <Container>
            <TopWrapper>
                <TopRow isReady={true}>
                    <Breadcrumbs>
                        {t('components.balanceBanner.breadcrumbs', { parentIndex: selectedParentIndex + 1, addressLabel: 'Tokens Page' })}
                    </Breadcrumbs>
                    <Update onClick={onSyncWallet} time={time} isReady={true} isWalletSyncing={isWalletSyncing} />
                </TopRow>
                <BottomRow isReady={true}/>
            </TopWrapper>
            <SectionContainer>aaa</SectionContainer>
        </Container>
    );
};

export default TokensPage;
