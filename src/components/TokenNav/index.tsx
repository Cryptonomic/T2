import React from 'react';
import styled from 'styled-components';

import tokenSvg from '../../../resources/imgs/token-side.svg';

const Container = styled.div<{ isActive: boolean }>`
  margin-bottom: 1px;
  padding: 9px 14px;
  cursor: pointer;
  background: ${({ isActive, theme: { colors } }) => {
    return isActive ? colors.accent : colors.white;
  }};
  display: flex;
`;

const SideImg = styled.img`
  margin-right: 12px;
  width: 32px;
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
  onClick?: () => void;
}

function TokenNav(props: Props) {
  const { isActive, onClick } = props;

  return (
    <Container isActive={isActive} onClick={onClick}>
      <SideImg src={tokenSvg} />
      <MainContainer>
        <TokenTitle isActive={isActive}>Token Name</TokenTitle>
        <TokenBalance isActive={isActive}>234567 ETL</TokenBalance>
      </MainContainer>
    </Container>
  );
}

export default TokenNav;
