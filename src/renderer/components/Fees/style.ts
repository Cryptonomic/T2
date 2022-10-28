import MenuItem from '@mui/material/MenuItem';
import styled from 'styled-components';

import { ms } from '../../styles/helpers';
import TezosIcon from '../../components/TezosIcon';
import Button from '../Button';

export const StyledSaveButton = styled(Button)`
    margin-top: 30px;
    padding-right: ${ms(9)};
    padding-left: ${ms(9)};
    height: 54px;
`;

export const ItemWrapper = styled(MenuItem)`
    &&& {
        &.Mui-selected {
            color: ${({ theme: { colors } }) => colors.primary};
        }
        width: 100%;
        font-size: 16px;
        font-weight: 300;
    }
`;

export const ModalContent = styled.div`
    padding: 35px 76px 63px 76px;
`;

export const MiniFeeTitle = styled.div`
    position: relative;
    font-size: 14px;
    line-height: 21px;
    font-weight: 300;
    color: ${({ theme: { colors } }) => colors.black};
    margin: -30px 0 20px 0;
`;

export const BoldSpan = styled.span`
    font-weight: 500;
`;

export const ErrorContainer = styled.div`
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: ${({ theme: { colors } }) => colors.error1};
`;

export const WarningIcon = styled(TezosIcon)`
    padding: 0 ${ms(-9)} 0 0;
    position: relative;
    top: 1px;
`;

export const FeeContentWrapper = styled.div`
    display: flex;
    align-items: center;
`;
