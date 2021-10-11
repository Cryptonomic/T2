import styled, { css } from 'styled-components';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import AddCircle from '@mui/icons-material/AddCircle';
import Check from '@mui/icons-material/Check';

import { ms } from '../../styles/helpers';

export const Container = styled.div`
    width: 80%;
    margin: 0 auto;
    padding: ${ms(3)} ${ms(4)};
`;

export const BackButtonContainer = styled.div`
    margin-bottom: 30px;
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
        &.Mui-selected {
            color: ${({ theme: { colors } }) => colors.primary};
        }
        position: relative;
        padding: 0 16px 0 37px;
        height: 48px;
        font-size: 16px;
        font-weight: 300;
        background-color: ${({ value, theme: { colors } }) => (value === 'addmore' ? colors.gray1 : colors.white)};
    }
`;

export const SelectRenderWrapper = styled.div`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`;

export const RemoveIconBtn = styled(IconButton)`
    &&& {
        color: #d3d3d3;
        margin-left: auto;
        &:hover {
            color: ${({ theme: { colors } }) => colors.accent};
        }
    }
`;

export const AddIcon = styled(AddCircle)`
    &&& {
        fill: ${({ theme: { colors } }) => colors.secondary};
        height: 19px;
        width: 19px;
        margin-right: 10px;
    }
`;

export const CheckIcon = styled(Check)`
    &&& {
        fill: ${({ theme: { colors } }) => colors.blue1};
        height: 21px;
        width: 21px;
        position: absolute;
        left: 16px;
    }
`;
