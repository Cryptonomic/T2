import * as React from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { Container as TopWrapper, TopRow, BottomRow, Breadcrumbs, AddressTitle } from '../../components/BalanceBanner/style';
import { Container } from '../../contracts/components/TabContainer/style';
import { BottomRowInner, Link, LinkIcon, Box, BoxIcon, BoxTitle, BoxDescription, Img, BoxContainer } from './style';
import defaultIcon from '../../../resources/contracts/token-icon.svg';

import config from '../../config.json';

import Update from '../../components/Update';

import { syncWalletThunk } from '../../reduxContent/wallet/thunks';

import { RootState } from '../../types/store';

const TokensPage = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { time, isWalletSyncing, selectedParentIndex } = useSelector((state: RootState) => state.app, shallowEqual);

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
                {config.supportedTokens.map((token) => (
                    <Box key={token.name} item={true} xs={3}>
                        <BoxIcon>
                            <Img src={defaultIcon} />
                        </BoxIcon>
                        <BoxTitle>{token.name}</BoxTitle>
                        <BoxDescription>
                            {token.symbol} {token.description}
                        </BoxDescription>
                    </Box>
                ))}
            </BoxContainer>
        </Container>
    );
};

export default TokensPage;
