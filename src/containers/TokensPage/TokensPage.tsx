import * as React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { BigNumber } from 'bignumber.js';

import SearchIcon from '@material-ui/icons/Search';

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
    ListsWrapper,
    SearchForm,
    SearchInput,
    BoxHover,
    BoxBg,
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

    const [search, setSearch] = useState('');
    const [activeTokens, setActiveTokens] = useState<any>([]);
    const [supportedTokens, setSupportedTokens] = useState<any>([]);
    const [hover, setHover] = useState('');

    const { storeType, status } = selectedAccount;
    const isReadyProp = isReady(status, storeType);

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

    const onSearchTokens = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;

        if (!value) {
            const tokensList = [...tokens].filter((token) => !token.hideOnLanding);
            const myTokens = tokensList.filter((mt) => mt.balance);
            const otherTokens = tokensList.filter((i) => !myTokens.map((m: any) => m.address).includes(i.address));
            setActiveTokens(myTokens);
            setSupportedTokens(otherTokens);
            setSearch('');
            return;
        }

        const allTokens = [...tokens].filter((token) => !token.hideOnLanding);
        const aTokens = allTokens.filter((mt) => mt.balance).filter((at) => at.symbol.toLowerCase().includes(value));
        const sTokens = allTokens
            .filter((i) => !aTokens.map((m: any) => m.address).includes(i.address))
            .filter((st) => st.displayName.toLowerCase().includes(value) || st.symbol.toLowerCase().includes(value));
        setActiveTokens(aTokens);
        setSupportedTokens(sTokens);
        setSearch(value);
    };

    const onHover = (id: string) => setHover(id);

    useEffect(() => {
        const allTokens = [...tokens].filter((token) => !token.hideOnLanding);
        const aTokens = allTokens.filter((mt) => mt.balance || mt.kind === TokenKind.wxtz);
        const sTokens = allTokens.filter((i) => !aTokens.map((m: any) => m.address).includes(i.address));
        setActiveTokens(aTokens);
        setSupportedTokens(sTokens);
    }, [tokens]);

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
            <ListsWrapper>
                <SearchForm>
                    <SearchInput
                        defaultValue=""
                        id="token-search-input"
                        placeholder="Search Tokens"
                        startAdornment={<SearchIcon style={{ fill: search ? '#000000' : '#BDBDBD' }} />}
                        onChange={onSearchTokens}
                        value={search}
                    />
                </SearchForm>
                {!!activeTokens.length && (
                    <>
                        <TokensTitle>Your Tokens</TokensTitle>
                        <Grid container={true} justify="flex-start">
                            {activeTokens.map((token, index) => (
                                <Box
                                    key={token.symbol}
                                    item={true}
                                    xs={3}
                                    onClick={() => onClickToken(token.address, index, token.kind)}
                                    onMouseEnter={() => onHover(token.address)}
                                    onMouseLeave={() => onHover('')}
                                >
                                    {hover === token.address && <BoxHover />}
                                    <BoxBg>
                                        <BoxIcon>
                                            <Img src={token.icon} />
                                        </BoxIcon>
                                        <BoxTitle>{token.displayName}</BoxTitle>
                                        <BoxDescription>
                                            {!!token.helpLink && (
                                                <BlueLink
                                                    isActive={!!token.helpLink}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        if (token.helpLink) {
                                                            onClickLink(token.helpLink);
                                                        }
                                                    }}
                                                >
                                                    {token.symbol}
                                                </BlueLink>
                                            )}{' '}
                                            {knownTokenDescription[token.symbol]}
                                        </BoxDescription>
                                        <BalanceTitle>Balance</BalanceTitle>
                                        <BalanceAmount>
                                            {formatAmount(false, token.balance, token.precision, token.round, token.scale)} {token.symbol}
                                        </BalanceAmount>
                                    </BoxBg>
                                </Box>
                            ))}
                        </Grid>
                        <HorizontalDivider />
                    </>
                )}
                {!!supportedTokens.length && (
                    <>
                        {<TokensTitle>{!activeTokens.length ? '' : 'Supported Tokens'}</TokensTitle>}
                        <Grid container={true} justify="flex-start">
                            {supportedTokens.map((token) => (
                                <Box
                                    key={token.symbol}
                                    item={true}
                                    xs={3}
                                    onMouseEnter={() => onHover(token.address)}
                                    onMouseLeave={() => onHover('')}
                                    onClick={() => token.helpLink && onClickLink(token.helpLink)}
                                >
                                    {hover === token.address && <BoxHover />}
                                    <BoxBg>
                                        <BoxIcon>
                                            <Img src={token.icon} />
                                        </BoxIcon>
                                        <BoxTitle>{token.displayName}</BoxTitle>
                                        <BoxDescription>
                                            {!!token.helpLink && <BlueLink isActive={!!token.helpLink}>{token.symbol}</BlueLink>}{' '}
                                            {knownTokenDescription[token.symbol]}
                                        </BoxDescription>
                                    </BoxBg>
                                </Box>
                            ))}
                        </Grid>
                    </>
                )}
            </ListsWrapper>
        </Container>
    );
};

export default TokensPage;
