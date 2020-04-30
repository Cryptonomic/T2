import React from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { BigNumber } from 'bignumber.js';

import TezosAddress from '../../../components/TezosAddress';
import TezosAmount from '../../../components/TezosAmount';
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
    console.log(JSON.stringify(token.details));
    return (
        <Container>
            <TopRow isReady={isReady}>
                <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
                <Update onClick={onSyncWallet} time={time} isReady={isReady} isWalletSyncing={isWalletSyncing} />
            </TopRow>
            <BottomRow isReady={isReady}>
                <AddressTitle>{displayName}</AddressTitle>
                <AddressInfo>
                    <TezosAddress address={publicKeyHash} weight={100} color="white" text={publicKeyHash} size={ms(1.7)} />
                    <Gap />
                    <TezosAmount color="white" size={ms(4.5)} amount={balance} weight="light" format={2} symbol={token.symbol} showTooltip={true} />
                </AddressInfo>
                <AddressInfo>
                    {token.details && token.details.paused !== true && 'Token is active.'}{' '}
                    {token.details &&
                        token.details.supply &&
                        'Total supply is ' + new BigNumber(token.details.supply).dividedBy(10 ** (token.scale || 0)).toNumber()}
                </AddressInfo>
            </BottomRow>
        </Container>
    );
}

BalanceBanner.defaultProps = {
    parentIndex: 0,
    isWalletSyncing: false
};

export default BalanceBanner;
