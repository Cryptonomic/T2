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

import { AddressInfo, AddressInfoLink, AddressTitle, Container, LinkIcon, TopRow, BottomRow, Breadcrumbs, Gap } from './style';

import { openLink } from '../../../utils/general';

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

    const breadcrumbs = t('components.balanceBanner.breadcrumbs', { parentIndex, addressLabel: displayName });

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
        <Container>
            <TopRow isReady={isReady}>
                <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
                <Update onClick={onSyncWallet} time={time} isReady={isReady} isWalletSyncing={isWalletSyncing} />
            </TopRow>
            <BottomRow isReady={isReady}>
                <AddressInfo>
                    <AddressTitle>{displayName}</AddressTitle>{' '}
                    {token.helpLink && (
                        <>
                            <AddressInfoLink onClick={() => openLink(token.details.helpLink)}>
                                Learn more
                                <LinkIcon iconName="new-window" size={ms(0)} color="white" onClick={() => openLink(token.details.helpLink)} />
                            </AddressInfoLink>
                        </>
                    )}
                </AddressInfo>
                <AddressInfo>
                    <TezosAddress address={publicKeyHash} weight={100} color="white" text={publicKeyHash} size={ms(1.7)} shorten={true} />
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
                <AddressInfo>
                    {token.details && token.details.paused === false && 'Token is active.'}{' '}
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
