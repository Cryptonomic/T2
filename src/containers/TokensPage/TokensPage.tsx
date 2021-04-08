import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

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

import { knownTokenContracts, knownTokenDescription } from '../../constants/Token';

import Update from '../../components/Update';

import { syncWalletThunk } from '../../reduxContent/wallet/thunks';

import { openLink } from '../../utils/general';

import { RootState } from '../../types/store';

const TokensPage = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { time, isWalletSyncing, selectedParentIndex } = useSelector((state: RootState) => state.app);
    const { selectedNode, nodesList } = useSelector((state: RootState) => state.settings);
    const currentNetwork = nodesList.find((n) => n.displayName === selectedNode); // Selected Network
    const myTokens = [knownTokenContracts[0]]; // TODO: get my tokens
    const supportedTokens = knownTokenContracts.filter(
        (i) => !!knownTokenDescription[i.symbol] && currentNetwork?.network === i.network && !myTokens.map((m) => m.symbol).includes(i.symbol)
    );

    const onSyncWallet = () => dispatch(syncWalletThunk());

    const onClickLink = (link: string) => openLink(link);

    return (
        <Container>
            <TopWrapper>
                <TopRow isReady={true}>
                    <Breadcrumbs>
                        {t('components.balanceBanner.breadcrumbs', { parentIndex: selectedParentIndex + 1, addressLabel: 'Tokens Page' })}
                    </Breadcrumbs>
                    <Update onClick={onSyncWallet} time={time} isReady={true} isWalletSyncing={isWalletSyncing} />
                </TopRow>
                <BottomRow isReady={true}>
                    <BottomRowInner>
                        <AddressTitle>Tokens</AddressTitle>
                        {/* TODO: add tokens link */}
                        <Link onClick={() => onClickLink('')}>
                            List a Token on Galleon <LinkIcon />
                        </Link>
                    </BottomRowInner>
                </BottomRow>
            </TopWrapper>
            {myTokens.length && (
                <>
                    <TokensTitle>Your Tokens</TokensTitle>
                    <Grid container={true} justify="flex-start">
                        {myTokens.map((token) => (
                            <Box key={token.symbol} item={true} xs={3}>
                                <BoxIcon>
                                    <Img src={token.icon} />
                                </BoxIcon>
                                <BoxTitle>{token.displayName}</BoxTitle>
                                <BoxDescription>
                                    <BlueLink isActive={!!token.helpLink} onClick={() => token.helpLink && onClickLink(token.helpLink)}>
                                        {token.symbol}
                                    </BlueLink>{' '}
                                    {knownTokenDescription[token.symbol]}
                                </BoxDescription>
                                <BalanceTitle>Balance</BalanceTitle>
                                <BalanceAmount>10.00 {token.symbol}</BalanceAmount>
                            </Box>
                        ))}
                    </Grid>
                    <HorizontalDivider />
                </>
            )}
            {supportedTokens.length && (
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
                                    <BlueLink isActive={!!token.helpLink} onClick={() => token.helpLink && onClickLink(token.helpLink)}>
                                        {token.symbol}
                                    </BlueLink>{' '}
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
