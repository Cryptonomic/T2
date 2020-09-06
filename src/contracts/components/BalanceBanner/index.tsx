import React from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { BigNumber } from 'bignumber.js';

import TezosAddress from '../../../components/TezosAddress';
import AmountView from '../../../components/AmountView';
import Update from '../../../components/Update';
import { ms } from '../../../styles/helpers';
import { syncWalletThunk } from '../../../reduxContent/wallet/thunks';
import { Token } from '../../../types/general';

import { RootState } from '../../../types/store';

import { AddressInfo, AddressTitle, Container, TopRow, BottomRow, Breadcrumbs, Gap } from './style';

interface Props {
    isReady: boolean;
    balance: number;
    publicKeyHash: string;
    displayName?: string;
    token: Token;
}

function BalanceBanner(props: Props) {
    // TODO: rename to TokenBalanceBanner
    const { isReady, balance, publicKeyHash, displayName, token } = props;

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { time, isWalletSyncing, selectedAccountIndex, selectedParentIndex } = useSelector((state: RootState) => state.app, shallowEqual);
    const addressIndex = selectedAccountIndex + 1;
    const parentIndex = selectedParentIndex + 1;

    const addressLabel = `${t('general.nouns.token_contract')} ${addressIndex}`;

    const breadcrumbs = t('components.balanceBanner.breadcrumbs', { parentIndex, addressLabel });

    function onSyncWallet() {
        dispatch(syncWalletThunk());
    }

    function formatAmount(amount): string {
        return new BigNumber(amount)
            .dividedBy(10 ** (token.scale || 0))
            .toNumber()
            .toLocaleString(undefined, { minimumFractionDigits: token.round, maximumFractionDigits: token.precision });
    }

    return (
        <Container data-spectron="token-balance-banner">
            <TopRow isReady={isReady}>
                <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
                <Update onClick={onSyncWallet} time={time} isReady={isReady} isWalletSyncing={isWalletSyncing} />
            </TopRow>
            <BottomRow isReady={isReady}>
                <AddressTitle data-spectron="token-name">{displayName}</AddressTitle>
                <AddressInfo>
                    <TezosAddress data-spectron="token-address" address={publicKeyHash} weight={100} color="white" text={publicKeyHash} size={ms(1.7)} />
                    <Gap />
                    <AmountView
                        color="white"
                        size={ms(4.5)}
                        amount={balance}
                        weight="light"
                        symbol={token.symbol}
                        showTooltip={true}
                        scale={token.scale}
                        precision={token.precision}
                        round={token.round}
                    />
                </AddressInfo>
                <AddressInfo data-spectron="token-address-info">
                    {token.details && token.details.paused !== true && 'Token is active.'}{' '}
                    {token.details && token.details.supply && 'Total supply is ' + formatAmount(token.details.supply) + '.'}
                </AddressInfo>
            </BottomRow>
        </Container>
    );
}

BalanceBanner.defaultProps = {
    parentIndex: 0,
    isWalletSyncing: false,
};

export default BalanceBanner;
