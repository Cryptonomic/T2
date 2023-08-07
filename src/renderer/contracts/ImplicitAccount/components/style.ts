import styled from 'styled-components';
import AddCircle from '@mui/icons-material/AddCircle';
import IconButton from '@mui/material/IconButton';

import TezosIcon from '../../../components/TezosIcon';
import Button from '../../../components/Button';
import { ms } from '../../../styles/helpers';

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    padding: 0 20px 20px 20px;
    position: relative;
`;

export const RowContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
`;

export const AmountContainer = styled.div`
    width: 100%;
    position: relative;
`;

export const FeeContainer = styled.div`
    width: 100%;
    display: flex;
    height: 64px;
`;

export const UseMax = styled.div`
    position: absolute;
    right: 23px;
    top: 24px;
    font-size: 12px;
    font-weight: 500;
    display: block;
    color: ${({ theme: { colors } }) => colors.accent};
    cursor: pointer;
`;

export const PasswordButtonContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    height: 100px;
    margin-top: auto;
    width: 100%;
`;

export const InvokeButton = styled(Button)`
    width: 194px;
    height: 50px;
    margin-bottom: 10px;
    margin-left: auto;
    padding: 0;
`;

export const WarningContainer = styled.div`
    height: 91px;
    width: 100%;
    border: solid 1px rgba(148, 169, 209, 0.49);
    border-radius: 3px;
    background-color: ${({ theme: { colors } }) => colors.light};
    display: flex;
    align-items: center;
    padding: 0 19px;
    margin-top: 36px;
`;
export const InfoText = styled.div`
    color: ${({ theme: { colors } }) => colors.primary};
    font-size: 16px;
    letter-spacing: 0.7px;
    margin-left: 11px;
    line-height: 21px;
`;

export const TooltipContainer = styled.div`
    padding: 10px;
    color: #000;
    font-size: 14px;
    max-width: 312px;
`;

export const TooltipTitle = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: ${({ theme: { colors } }) => colors.primary};
`;

export const TooltipContent = styled.div`
    margin-top: 8px;
    font-size: 14px;
    line-height: 21px;
    width: 270px;
    font-weight: 300;
    color: ${({ theme: { colors } }) => colors.black};
`;

export const BoldSpan = styled.span`
    font-weight: 500;
`;

export const FeeTooltipBtn = styled(IconButton)`
    &&& {
        position: relative;
        top: 1px;
    }
`;

export const BurnTooltipBtn = styled(IconButton)`
    &&& {
        position: absolute;
        left: 82px;
        top: 21px;
    }
`;

export const AddCircleWrapper = styled(AddCircle)<{ active: number }>`
    &&& {
        fill: #7b91c0;
        width: ${ms(1.5)};
        height: ${ms(1.5)};
        opacity: ${({ active }) => (active ? 1 : 0.5)};
        cursor: ${({ active }) => (active ? 'pointer' : 'default')};
        margin-right: ${({ active }) => (active ? '5px' : '0px')};
    }
`;

export const AddDelegationContainer = styled.div`
    display: flex;
    align-items: center;
    margin-top: 45px;
    color: ${({ theme: { colors } }) => colors.primary};
`;

export const AddDelegationTooltipIcon = styled(TezosIcon)`
    color: ${({ theme: { colors } }) => colors.blue7};
`;

export const AddDelegationTooltipTitle = styled.div`
    width: 249px;
    height: 19px;
    opacity: 0.95;
    font-size: 1rem;
    font-weight: bold;
    color: ${({ theme: { colors } }) => colors.primary};
    margin-bottom: 6px;
`;

export const AddDelegationTooltipText = styled.div`
    width: 281px;
    height: 63px;
    font-size: 0.875rem;
    font-weight: 300;
    line-height: 1.5;
    color: ${({ theme: { colors } }) => colors.black3};
`;

export const NoFundTooltip = styled.div`
    color: ${({ theme: { colors } }) => colors.primary};
    font-weight: 100;
    font-size: ${ms(-1)};
    max-width: ${ms(12)};
`;
