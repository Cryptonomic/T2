import React from 'react';
import styled from 'styled-components';

import { ms } from '../../styles/helpers';
import { Token } from '../../types/general';
import defaultIcon from '../../../resources/contracts/token-icon.svg';

import AmountView from '../AmountView';

const Container = styled.div<{ isActive: boolean }>`
    margin-bottom: 1px;
    padding: 9px 14px;
    background: ${({ isActive, theme: { colors } }) => {
        return isActive ? colors.accent : colors.white;
    }};
    display: flex;
`;

const SideImg = styled.img`
    margin-right: 12px;
    width: 32px;
    object-fit: contain;
`;

const MainContainer = styled.div``;

const TokenTitle = styled.p<{ isActive: boolean }>`
    margin: 0;
    font-size: 16px;
    line-height: 20px;
    color: ${({ isActive, theme: { colors } }) => (isActive ? colors.white : colors.secondary)};
`;

const TokenBalance = styled.p<{ isActive: boolean }>`
    margin: 0;
    font-size: 14px;
    line-height: 18px;
    margin-top: 4px;
    color: ${({ isActive, theme: { colors } }) => (isActive ? colors.white : colors.primary)};
    font-weight: 500;
`;

interface Props {
    isActive: boolean;
    token: Token;
    dataSpectron?: string;
    onClick?: () => void;
}

function TokenNav(props: Props) {
    const { isActive, token, dataSpectron, onClick } = props;

    const icon = token.icon ? token.icon : defaultIcon;

    return (
        <Container data-spectron={dataSpectron} isActive={isActive} onClick={onClick}>
            <SideImg src={icon} />
            <MainContainer>
                <TokenTitle data-spectron="token-title" isActive={isActive}>{token.displayName}</TokenTitle>
                <TokenBalance data-spectron="token-amount" isActive={isActive}>
                    <AmountView
                        color={isActive ? '#FFFFFF' : 'primary'}
                        size={ms(0)}
                        amount={token.balance}
                        scale={token.scale}
                        precision={token.precision}
                        round={token.round}
                        symbol={token.symbol}
                    />
                </TokenBalance>
            </MainContainer>
        </Container>
    );
}

export default TokenNav;
