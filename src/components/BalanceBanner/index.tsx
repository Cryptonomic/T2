import React, { useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { KeyStoreType } from 'conseiljs';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';

import KeyDetails from '../../featureModals/KeyDetails';
import TezosAddress from '../TezosAddress';
import TezosAmount from '../TezosAmount';
import Update from '../Update';
import Tooltip from '../Tooltip';
import { openLink } from '../../utils/general';
import { AddressType } from '../../types/general';
import keyIconSvg from '../../../resources/imgs/Key_Icon.svg';
import { ms } from '../../styles/helpers';
import { syncWalletThunk } from '../../reduxContent/wallet/thunks';
import { getBakerDetails, getTezosDomains, getPrices } from '../../reduxContent/app/thunks';
import { wertUrl } from '../../config.json';
import { RootState } from '../../types/store';

const { shell } = require('electron');
const { Mnemonic } = KeyStoreType;

import {
    Container,
    TopRow,
    BottomRow,
    AddressTitle,
    AddressTitleIcon,
    AddressInfo,
    DelegateName,
    DelegateContainer,
    Breadcrumbs,
    KeyIconButton,
    KeyIcon,
    BellIcon,
    TooltipContent,
    Gap,
    LinkIcon,
    LinkContainer,
    Column,
    Currencies,
    CurrencySymbol,
    WertButton,
} from './style';

interface Props {
    storeType?: string | number;
    isReady: boolean;
    balance: number;
    publicKeyHash: string;
    secretKey: string; // TODO: make optional
    delegatedAddress?: string | null;
    displayName?: string;
    symbol?: string;
}

function BalanceBanner(props: Props) {
    const { storeType, isReady, balance, publicKeyHash, delegatedAddress, displayName, symbol } = props;

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { time, isWalletSyncing, isLedger, selectedAccountType, selectedAccountIndex, selectedParentIndex } = useSelector(
        (state: RootState) => state.app,
        shallowEqual
    );
    const addressIndex = selectedAccountIndex + 1;
    const parentIndex = selectedParentIndex + 1;

    const [isShowKey, setIsShowKey] = useState(false);

    const bakerName = getBakerDetails(String(delegatedAddress));
    const domainName = getTezosDomains(String(publicKeyHash));
    const xtzPrices = getPrices();

    let addressLabel = '';
    switch (selectedAccountType) {
        case AddressType.Manager: {
            addressLabel = t('components.address.manager_address');
            break;
        }
        case AddressType.Smart: {
            addressLabel = `${t('general.nouns.smart_contract')} ${addressIndex}`;
            break;
        }
        case AddressType.Token: {
            addressLabel = `${t('general.nouns.token_contract')} ${addressIndex}`;
            break;
        }
        default: {
            addressLabel = t('components.address.delegation_contract', { index: addressIndex });
            break;
        }
    }

    const isManager = selectedAccountType === AddressType.Manager;

    const breadcrumbs = t('components.balanceBanner.breadcrumbs', { parentIndex, addressLabel });

    function onSyncWallet() {
        dispatch(syncWalletThunk());
    }

    function openNotifierUrl() {
        openLink(`https://t.me/TezosNotifierBot?start=arronax_${publicKeyHash}`);
    }

    function openHarpoonUrl() {
        openLink(`https://harpoon.arronax.io/${delegatedAddress}`);
    }

    const openWertUrl = async () => {
        let url = wertUrl;
        url = url + publicKeyHash;
        url = url + '&currency=USD&currency_amount=100';
        await shell.openExternal(url);
    };

    return (
        <Container>
            <TopRow isReady={isReady}>
                <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
                <Update onClick={onSyncWallet} time={time} isReady={isReady} isWalletSyncing={isWalletSyncing} />
            </TopRow>
            <BottomRow isReady={isReady}>
                {selectedAccountType !== AddressType.Smart && (
                    <AddressTitle>
                        {selectedAccountType !== AddressType.Token && (
                            <AddressTitleIcon iconName={isManager ? 'manager' : 'smart-address'} size={ms(0)} color="white" />
                        )}
                        {!displayName ? addressLabel : displayName}

                        {isManager && !isLedger && (
                            <KeyIconButton size="small" color="primary" onClick={() => setIsShowKey(true)}>
                                <KeyIcon src={keyIconSvg} />
                            </KeyIconButton>
                        )}
                        {isManager && (
                            <Tooltip position="bottom" content={<TooltipContent>{t('components.balanceBanner.tooltip_content')}</TooltipContent>}>
                                <IconButton size="small" color="primary" onClick={() => openNotifierUrl()}>
                                    <BellIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                    </AddressTitle>
                )}
                <AddressInfo>
                    <Column>
                        {domainName && domainName.length > 0 && <>{domainName}</>}
                        <TezosAddress address={publicKeyHash} weight={100} color="white" text={publicKeyHash} size={ms(1.7)} shorten={true} />
                    </Column>
                    <Gap />
                    {isReady || storeType === Mnemonic ? (
                        <div style={{ marginLeft: 'auto' }}>
                            <div>
                                <TezosAmount color="white" size={ms(4.5)} amount={balance} weight="light" format={2} symbol={symbol} showTooltip={true} />
                            </div>
                            {wertUrl.length > 0 && (
                                <>
                                    <WertButton onClick={openWertUrl}>Buy Tezos</WertButton>
                                    <LinkIcon iconName="new-window" color="white" />
                                </>
                            )}
                        </div>
                    ) : null}
                    {selectedAccountType === AddressType.Manager && xtzPrices.usd !== '-1' && (
                        <Currencies>
                            <div>
                                {((balance * Number(xtzPrices.usd)) / 1_000_000).toFixed(2)}
                                <CurrencySymbol>USD</CurrencySymbol>
                            </div>
                            <div>
                                {((balance * Number(xtzPrices.eur)) / 1_000_000).toFixed(2)}
                                <CurrencySymbol>EUR</CurrencySymbol>
                            </div>
                            <div>
                                {((balance * Number(xtzPrices.jpy)) / 1_000_000).toFixed(0)}
                                <CurrencySymbol>JPY</CurrencySymbol>
                            </div>
                        </Currencies>
                    )}
                </AddressInfo>
                {delegatedAddress && (
                    <DelegateContainer>
                        <>{t('components.balanceBanner.delegated_to')}</>
                        {bakerName && <DelegateName>{bakerName}</DelegateName>}
                        {!bakerName && (
                            <span style={{ marginLeft: '3px', marginRight: '3px' }}>
                                <TezosAddress address={delegatedAddress} color="white" size={ms(0)} weight={400} shorten={true} />
                            </span>
                        )}
                        <LinkContainer onClick={() => openHarpoonUrl()}>
                            view baker details on Harpoon
                            <LinkIcon iconName="new-window" color="white" />
                        </LinkContainer>
                    </DelegateContainer>
                )}
            </BottomRow>

            {isShowKey && <KeyDetails open={isShowKey} onClose={() => setIsShowKey(false)} />}
        </Container>
    );
}

BalanceBanner.defaultProps = {
    parentIndex: 0,
    isWalletSyncing: false,
};

export default BalanceBanner;
