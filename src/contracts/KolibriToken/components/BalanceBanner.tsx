import React, { useEffect, useState } from 'react';
import { useSelector, useStore, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { BigNumber } from 'bignumber.js';

import TezosAddress from '../../../components/TezosAddress';
import AmountView from '../../../components/AmountView';
import Update from '../../../components/Update';
import { ms } from '../../../styles/helpers';
import { syncWalletThunk } from '../../../reduxContent/wallet/thunks';
import { Token } from '../../../types/general';
import { setModalOpen } from '../../../reduxContent/modal/actions';

import { Column } from '../../../components/BalanceBanner/style';

import { RootState } from '../../../types/store';

import { AddressInfo, AddressInfoLink, AddressTitle, Container, LinkIcon, TopRow, BottomRow, Breadcrumbs, Gap } from '../../components/BalanceBanner/style';

import { openLink } from '../../../utils/general';
import { getMainNode } from '../../../utils/settings';

import { SmallButton } from '../../components/style';
import { estimatePendingRewards } from '../thunks';

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
    const store = useStore<RootState>();
    const { selectedNode, nodesList } = store.getState().settings;
    const { selectedParentHash } = store.getState().app;
    const { tezosUrl } = getMainNode(nodesList, selectedNode);

    const addressIndex = selectedAccountIndex + 1;
    const parentIndex = selectedParentIndex + 1;

    const addressLabel = `${t('general.nouns.token_contract')} ${addressIndex}`;

    const breadcrumbs = t('components.balanceBanner.breadcrumbs', { parentIndex, addressLabel: displayName });

    const [pendingRewards, setPendingRewards] = useState('0.0');
    useEffect(() => {
        updatePendingRewards();
    }, [pendingRewards]);

    function updatePendingRewards() {
        const getData = async () => {
            const rewards = await estimatePendingRewards(tezosUrl, selectedParentHash);
            setPendingRewards(rewards);
        };

        getData();
    }

    function onSyncWallet() {
        dispatch(syncWalletThunk());
        updatePendingRewards();
    }

    function formatAmount(amount): string {
        const minDigits = Math.min(token.round || 0, 18);
        const maxDigits = Math.min(token.precision || 0, 18);
        return new BigNumber(amount)
            .dividedBy(10 ** (token.scale || 0))
            .toNumber()
            .toLocaleString(undefined, { minimumFractionDigits: minDigits, maximumFractionDigits: maxDigits });
    }

    function harvestTrigger() {
        dispatch(setModalOpen(true, 'KolibriHarvest'));
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
                        <AddressInfoLink onClick={() => openLink(token.helpLink || '')}>
                            Learn more
                            <LinkIcon iconName="new-window" size={ms(0)} color="white" onClick={() => openLink(token.helpLink || '')} />
                        </AddressInfoLink>
                    )}
                </AddressInfo>
                <AddressInfo>
                    <TezosAddress address={publicKeyHash} weight={100} color="white" text={publicKeyHash} size={ms(1.7)} shorten={true} />
                    <Gap />
                    <div style={{ marginLeft: 'auto' }}>
                        <Column>
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
                            {pendingRewards !== '0.0' && (
                                <div style={{ float: 'right' }}>
                                    <span style={{ marginRight: '5px' }}>
                                        {t('components.plenty.nouns.pending_rewards')}: {pendingRewards} kDAO
                                    </span>
                                    <SmallButton buttonTheme="primary" onClick={() => harvestTrigger()}>
                                        {t('components.plenty.verbs.harvest')}
                                    </SmallButton>
                                </div>
                            )}
                        </Column>
                    </div>
                </AddressInfo>
                <AddressInfo>
                    {token.details && token.details.paused === false && 'Token is active.'}{' '}
                    {token.details && token.details.supply && 'Total supply is ' + formatAmount(token.details.supply) + '.'}
                    {token.details && token.details.holders && ' ' + Number(token.details.holders) + ' holders.'}
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
