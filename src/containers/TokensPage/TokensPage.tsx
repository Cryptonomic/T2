import * as React from 'react';
import { useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { BigNumber } from 'bignumber.js';

import Grid from '@material-ui/core/Grid';

import { Container as TopWrapper, TopRow, BottomRow, Breadcrumbs, AddressTitle } from '../../components/BalanceBanner/style';
import { Container } from '../../contracts/components/TabContainer/style';
import {
    BottomRowInner,
    Link,
    LinkIcon,
    Box,
    BoxIcon,
    BoxTitle,
    BoxDescription,
    Img,
    BlueLink,
    TokensTitle,
    HorizontalDivider,
    BalanceTitle,
    BalanceAmount,
} from './style';

import { knownTokenDescription } from '../../constants/Token';

import Update from '../../components/Update';

import { syncWalletThunk } from '../../reduxContent/wallet/thunks';

import { changeAccountThunk } from '../../reduxContent/app/thunks';

import { openLink, isReady } from '../../utils/general';

import { getAccountSelector } from '../../contracts/duck/selectors';

import { RootState } from '../../types/store';

import { AddressType, TokenKind } from '../../types/general';

import { tokensSupportURL } from '../../config.json';

const TokensPage = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { time, isWalletSyncing, selectedParentIndex, selectedAccountIndex } = useSelector((state: RootState) => state.app);
    const selectedAccount = useSelector(getAccountSelector);
    const tokens = useSelector((state: RootState) => state.wallet.tokens);
    const identities = useSelector((state: RootState) => state.wallet.identities, shallowEqual);

    const { storeType, status } = selectedAccount;
    const isReadyProp = isReady(status, storeType);
    const allTokens = [...tokens].filter((token) => !token.hideOnLanding);
    const activeTokens = allTokens.filter((mt) => mt.balance);
    const supportedTokens = allTokens.filter((i) => !activeTokens.map((m) => m.address).includes(i.address));

    const formatAmount = (truncateAmount, amount, precision, round, scale): string => {
        const digits = truncateAmount ? precision : round;
        return new BigNumber(amount)
            .dividedBy(10 ** scale)
            .toNumber()
            .toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
    };

    const onSyncWallet = () => dispatch(syncWalletThunk());

    const onClickLink = (link: string) => openLink(link);

    const onClickToken = (addressId, index, addressType) => {
        let tokenType = AddressType.Token;

        if (addressType === TokenKind.wxtz) {
            tokenType = AddressType.wXTZ;
        }

        if (addressType === TokenKind.tzbtc) {
            tokenType = AddressType.TzBTC;
        }

        if (addressType === TokenKind.kusd) {
            tokenType = AddressType.kUSD;
        }

        if (addressType === TokenKind.objkt) {
            tokenType = AddressType.objkt;
        }

        if (addressType === TokenKind.blnd) {
            tokenType = AddressType.BLND;
        }

        if (addressType === TokenKind.stkr) {
            tokenType = AddressType.STKR;
        }

        const { publicKeyHash } = identities[selectedAccountIndex];
        dispatch(changeAccountThunk(addressId, publicKeyHash, index, selectedAccountIndex, tokenType));
    };

    return (
        <Container>
            <TopWrapper>
                <TopRow isReady={isReadyProp}>
                    <Breadcrumbs>
                        {t('components.balanceBanner.breadcrumbs', { parentIndex: selectedParentIndex + 1, addressLabel: 'Tokens Page' })}
                    </Breadcrumbs>
                    <Update onClick={onSyncWallet} time={time} isReady={isReadyProp} isWalletSyncing={isWalletSyncing} />
                </TopRow>
                <BottomRow isReady={isReadyProp}>
                    <BottomRowInner>
                        <AddressTitle>Tokens</AddressTitle>
                        {tokensSupportURL && tokensSupportURL.length > 0 && (
                            <Link onClick={() => onClickLink(tokensSupportURL)}>
                                List a token in Galleon <LinkIcon />
                            </Link>
                        )}
                    </BottomRowInner>
                </BottomRow>
            </TopWrapper>
            {!!activeTokens.length && (
                <>
                    <TokensTitle>Your Tokens</TokensTitle>
                    <Grid container={true} justify="flex-start">
                        {activeTokens.map((token, index) => (
                            <Box key={token.symbol} item={true} xs={3} onClick={() => onClickToken(token.address, index, token.kind)}>
                                <BoxIcon>
                                    <Img src={token.icon} />
                                </BoxIcon>
                                <BoxTitle>{token.displayName}</BoxTitle>
                                <BoxDescription>
                                    {!!token.helpLink && (
                                        <BlueLink isActive={!!token.helpLink} onClick={() => token.helpLink && onClickLink(token.helpLink)}>
                                            {token.symbol}
                                        </BlueLink>
                                    )}{' '}
                                    {knownTokenDescription[token.symbol]}
                                </BoxDescription>
                                <BalanceTitle>Balance</BalanceTitle>
                                <BalanceAmount>
                                    {formatAmount(false, token.balance, token.precision, token.round, token.scale)} {token.symbol}
                                </BalanceAmount>
                            </Box>
                        ))}
                    </Grid>
                    <HorizontalDivider />
                </>
            )}
            {!!supportedTokens.length && (
                <>
                    <TokensTitle>Supported Tokens</TokensTitle>
                    <Grid container={true} justify="flex-start">
                        {supportedTokens.map((token) => (
                            <Box key={token.symbol} item={true} xs={3}>
                                <BoxIcon>
                                    <Img src={token.icon} />
                                </BoxIcon>
                                <BoxTitle>{token.displayName}</BoxTitle>
                                <BoxDescription>
                                    {!!token.helpLink && (
                                        <BlueLink isActive={!!token.helpLink} onClick={() => token.helpLink && onClickLink(token.helpLink)}>
                                            {token.symbol}
                                        </BlueLink>
                                    )}{' '}
                                    {knownTokenDescription[token.symbol]}
                                </BoxDescription>
                            </Box>
                        ))}
                    </Grid>
                </>
            )}
        </Container>
    );
};

export default TokensPage;
