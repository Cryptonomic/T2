import * as React from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { Container as TopWrapper, TopRow, BottomRow, Breadcrumbs, AddressTitle } from '../../components/BalanceBanner/style';
import { Container, SectionContainer } from '../../contracts/components/TabContainer/style';
import { BottomRowInner, Link, LinkIcon, Box, BoxIcon, BoxTitle, BoxDescription, Img } from './style';
import defaultIcon from '../../../resources/contracts/token-icon.svg';

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
            <SectionContainer>
                <Box>
                    <BoxIcon>
                        <Img src={defaultIcon} />
                    </BoxIcon>
                    <BoxTitle>tzBTC</BoxTitle>
                    <BoxDescription>
                        tzBTC is a Tezos token which is fully collateralized with Bitcoin, issued by the Bitcoin Association Switzerland
                    </BoxDescription>
                </Box>
            </SectionContainer>
        </Container>
    );
};

export default TokensPage;
