import styled, { css } from 'styled-components';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';
import TezosIcon from '../../components/TezosIcon';
import { H4 } from '../../components/Heading';
import { ms } from '../../styles/helpers';

import ButtonCom from '../Button';

export const CreateAccountSlideContainer = styled.div`
    max-width: 579px;
    height: 426px;
    margin: 0 auto;
    position: relative;
`;

export const DescriptionContainer = styled.div`
    font-size: 18px;
    color: ${({ theme: { colors } }) => colors.black1};
    line-height: 1.28;
    font-weight: 300;
`;

export const BackButtonContainer = styled.div`
    margin-bottom: 20px;
`;

export const ValidFormContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-bottom: 26px;
`;

export const ActionButton = styled(ButtonCom)`
    width: 194px;
    height: 50px;
    padding: 0;
    position: absolute;
    bottom: 0;
`;

export const IconContainer = styled.div`
    float: right;
    margin-top: 16px;
`;

export const RefreshButton = styled(Button)`
    &&& {
        padding: 0;
        font-size: 14px;
        &.MuiButton-textSecondary:hover {
            background-color: transparent;
        }
        .MuiButton-startIcon {
            margin-right: 2px;
        }
    }
`;

export const RefreshIconWrapper = styled(RefreshIcon)`
    &&& {
        transform: scaleX(-1);
        font-size: 24px;
    }
`;

export const TitleContainer = styled.div`
    font-size: 18px;
    color: ${({ theme: { colors } }) => colors.black1};
    line-height: 1.28;
    font-weight: bold;
    margin-bottom: 30px;
`;

export const SeedsContainer = styled.div`
    display: flex;
    background-color: #f7faff;
    margin-top: 18px;
`;

export const SeedColume = styled.div`
    flex: 1;
    border-right: solid 1px ${({ theme: { colors } }) => colors.index0};
    padding: 18px 10px 18px 14px;
    &:last-child {
        border: none;
    }
`;

export const SeedItem = styled.div`
    line-height: 40px;
    font-size: 16px;
    display: flex;
`;

export const SeedIndex = styled.span`
    color: ${({ theme: { colors } }) => colors.index0};
    margin-right: 20px;
    text-align: right;
    width: 26px;
`;
