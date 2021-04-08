import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { Container as TopWrapper, TopRow, BottomRow, Breadcrumbs, AddressTitle } from '../../components/BalanceBanner/style';
import { Container } from '../../contracts/components/TabContainer/style';
import { BottomRowInner, Link, LinkIcon, Box, BoxIcon, BoxTitle, BoxDescription, Img, BoxContainer } from './style';

import { knownTokenContracts, knownTokenDescription } from '../../constants/Token';

import Update from '../../components/Update';

import { syncWalletThunk } from '../../reduxContent/wallet/thunks';

import { RootState } from '../../types/store';

const TokensPage = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { time, isWalletSyncing, selectedParentIndex } = useSelector((state: RootState) => state.app);
    const { selectedNode, nodesList } = useSelector((state: RootState) => state.settings);
    const currentNetwork = nodesList.find((n) => n.displayName === selectedNode);

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
                <BottomRow isReady={true}>
                    <BottomRowInner>
                        <AddressTitle>Tokens</AddressTitle>
                        <Link>
                            List a Token on Galleon <LinkIcon />
                        </Link>
                    </BottomRowInner>
                </BottomRow>
            </TopWrapper>
            <BoxContainer container={true} justify="flex-start">
                {knownTokenContracts
                    .filter((i) => !!knownTokenDescription[i.symbol] && currentNetwork?.network === i.network)
                    .map((token) => (
                        <Box key={token.symbol} item={true} xs={3}>
                            <BoxIcon>
                                <Img src={token.icon} />
                            </BoxIcon>
                            <BoxTitle>{token.displayName}</BoxTitle>
                            <BoxDescription>
                                {token.symbol} {knownTokenDescription[token.symbol]}
                            </BoxDescription>
                        </Box>
                    ))}
            </BoxContainer>
        </Container>
    );
};

export default TokensPage;
