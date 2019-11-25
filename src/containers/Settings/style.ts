import styled, { css } from 'styled-components';
import MenuItem from '@material-ui/core/MenuItem';
import Close from '@material-ui/icons/Close';

import { ms } from '../../styles/helpers';

export const Container = styled.div`
  width: 80%;
  margin: 0 auto;
  padding: ${ms(3)} ${ms(4)};
`;

export const BackToWallet = styled.div`
  display: flex;
  align-items: center;
  color: #4486f0;
  cursor: pointer;
  margin-bottom: 2.5rem;
`;

export const Content = styled.div`
  background-color: ${({ theme: { colors } }) => colors.white};
  padding: 50px 47px 63px 55px;
  margin-top: 35px;
`;

export const Content6 = styled(Content)`
  margin-top: 6px;
`;

export const ContentTitle = styled.div`
  font-size: 24px;
  font-weight: 300;
  line-height: 34px;
  color: ${({ theme: { colors } }) => colors.primary};
  letter-spacing: 1px;
  margin-bottom: 32px;
`;

export const RowCss = css`
  display: flex;
  align-items: center;
`;

export const RowForParts = styled.div`
  ${RowCss};
  justify-content: space-between;
`;

export const Part = styled.div`
  width: 48%;
`;

export const SelectOption = styled.div`
  ${RowCss};
  padding: 10px 0px;
`;

export const OptionStatus = styled.div`
  ${RowCss};
  flex-direction: column;
  align-items: center;
  width: 24px;
`;

export const OptionLabel = styled.div<{ isActive: boolean }>`
  ${RowCss};
  flex-direction: column;
  align-items: flex-start;
  color: ${({ isActive, theme: { colors } }) => (isActive ? colors.blue1 : colors.primary)};
  margin-left: 5px;
`;

export const NodeName = styled.div`
  font-size: 16px;
  line-height: 16px;
  letter-spacing: 0.7;
`;

export const NodeUrl = styled.div`
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.5;
`;

export const NodeUrlSpan = styled(NodeUrl)`
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.5;
  display: inline;
`;

export const ItemWrapper = styled(MenuItem)`
  &&& {
    &[class*='selected'] {
      color: ${({ theme: { colors } }) => colors.primary};
    }
    width: 100%;
    font-size: 16px;
    font-weight: 300;
    background-color: ${({ value, theme: { colors } }) =>
      value === 'addmore' ? colors.gray1 : colors.white};
  }
`;

export const SelectRenderWrapper = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const RemoveIconWrapper = styled.span`
  margin-right: 30px;
  margin-left: auto;
`;

export const RemoveIcon = styled(Close)`
  color: #d3d3d3;
  &:hover {
    color: ${({ theme: { colors } }) => colors.accent};
  }
`;
