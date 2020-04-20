import React, { useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { StoreType } from 'conseiljs';
import { useTranslation } from 'react-i18next';

import TezosAddress from '../../../components/TezosAddress';
import TezosAmount from '../../../components/TezosAmount';
import Update from '../../../components/Update';
import { openLink } from '../../../utils/general';
import { ms } from '../../../styles/helpers';
import { syncWalletThunk } from '../../../reduxContent/wallet/thunks';

import { RootState } from '../../../types/store';

const { Mnemonic } = StoreType;

import { AddressInfo, AddressTitle, Container, Delegate, TopRow, BottomRow, DelegateContainer, Breadcrumbs, Gap } from './style';

interface Props {
    storeType?: string | number;
    isReady: boolean;
    balance: number;
    publicKeyHash: string;
    delegatedAddress?: string | null;
    displayName?: string;
    symbol?: string;
}

function BalanceBanner(props: Props) {
    const { storeType, isReady, balance, publicKeyHash, delegatedAddress, displayName, symbol } = props;

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { time, isWalletSyncing, selectedAccountIndex, selectedParentIndex } = useSelector((state: RootState) => state.app, shallowEqual);
    const addressIndex = selectedAccountIndex + 1;
    const parentIndex = selectedParentIndex + 1;

    const addressLabel = `${t('general.nouns.smart_contract')} ${addressIndex}`;

    const breadcrumbs = t('components.balanceBanner.breadcrumbs', { parentIndex, addressLabel });

    function onSyncWallet() {
        dispatch(syncWalletThunk());
    }

    function openUrl() {
        const newUrl = `https://t.me/TezosNotifierBot?start=mininax_${publicKeyHash}`;
        openLink(newUrl);
    }

    return (
        <Container>
            <TopRow isReady={isReady}>
                <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
                <Update onClick={onSyncWallet} time={time} isReady={isReady} isWalletSyncing={isWalletSyncing} />
            </TopRow>
            <BottomRow isReady={isReady}>
                {<AddressTitle>{!displayName ? addressLabel : displayName}</AddressTitle>}
                <AddressInfo>
                    <TezosAddress address={publicKeyHash} weight={100} color="white" text={publicKeyHash} size={ms(1.7)} />
                    <Gap />

                    {isReady || storeType === Mnemonic ? (
                        <TezosAmount color="white" size={ms(4.5)} amount={balance} weight="light" format={2} symbol={symbol} showTooltip={true} />
                    ) : null}
                </AddressInfo>
                {delegatedAddress && (
                    <DelegateContainer>
                        <Delegate>{t('components.balanceBanner.delegated_to')}</Delegate>
                        <TezosAddress address={delegatedAddress} color="white" size={ms(-1)} weight={300} />
                    </DelegateContainer>
                )}
            </BottomRow>
        </Container>
    );
}

BalanceBanner.defaultProps = {
    parentIndex: 0,
    isWalletSyncing: false
};

export default BalanceBanner;
