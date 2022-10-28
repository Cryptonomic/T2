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
    cursor: pointer;
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
    onClick?: () => void;
}

function TokenNav(props: Props) {
    const { isActive, token, onClick } = props;

    const icon = token.icon ? token.icon : defaultIcon;

    const shortName = token.displayName.substring(0, 24);
    const displayName = shortName.length < token.displayName.length ? shortName + '...' : token.displayName;

    return (
        <Container isActive={isActive} onClick={onClick}>
            <SideImg src={icon} />
            <MainContainer>
                <TokenTitle isActive={isActive}>{displayName}</TokenTitle>
                <TokenBalance isActive={isActive}>
                    <AmountView
                        color={isActive ? '#FFFFFF' : 'primary'}
                        size={ms(0)}
                        amount={token.balance}
                        scale={token.scale}
                        precision={token.precision}
                        round={token.round}
                        symbol={token.symbol}
                        selectable={false}
                    />
                </TokenBalance>
            </MainContainer>
        </Container>
    );
}

export default TokenNav;
