import styled, { css } from 'styled-components';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import { H4 } from '../../components/Heading';
import { ms } from '../../styles/helpers';

export const Container = styled.div`
    width: 80%;
    margin: ${ms(1)} auto 0;
    padding: ${ms(3)} ${ms(4)};
`;

export const InputWithTooltip = styled.div`
    position: relative;
    width: 47%;
`;

export const TooltipBtn = styled(IconButton)`
    &&& {
        position: absolute;
        right: 5px;
        top: 22px;
    }
`;

export const FormTitle = styled(H4)`
    font-size: ${ms(1)};
    margin-bottom: 30px;
    color: ${({ theme: { colors } }) => colors.gray0};
`;

export const TooltipContainer = styled.div`
    font-size: ${ms(-1)};
    color: ${({ theme: { colors } }) => colors.primary};
    max-width: ${ms(15.5)};
    font-weight: ${({ theme: { typo } }) => typo.weights.light};
`;

export const TooltipTitle = styled.p`
    font-weight: ${({ theme: { typo } }) => typo.weights.bold};
    margin: 0 0 ${ms(-1)} 0;
`;

export const RowInputs = styled.div`
    margin-top: 22px;
    display: flex;
    justify-content: space-between;
`;

export const ImportButton = styled(Fab)`
    &&& {
        margin-top: 25px;
        width: 194px;
    }
`;

export const Link = styled.span`
    cursor: pointer;
    text-decoration: underline;
    color: ${({ theme: { colors } }) => colors.blue2};
`;

export const TitleContainer = styled.div`
    background-color: #417def;
    color: white;
    font-size: 24px;
    width: 100%;
    height: 80px;
    padding: 20px 60px;
    display: flex;
    align-items: center;
    position: relative;
`;

export const TabContainer = styled.div`
    display: flex;
    align-items: center;
    height: 60px;
    width: 100%;
    justify-content: space-around;
`;

export const Tab = styled.div<{ isActive: boolean }>`
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    width: 100%;
    height: 100%;
    ${({ isActive }) => {
        if (isActive) {
            return css`
                color: #1a325f;
                background-color: white;
                text-align: center;
                padding: 0 10px;
            `;
        }
        return css`
            background-color: #417def;
            color: white;
            text-align: center;
            padding: 0 10px;
        `;
    }};
`;

export const AddAddressBodyContainer = styled.div`
    background-color: white;
    padding: 2rem;
`;

export const ShowHidePwd = styled.div`
    position: absolute;
    top: 24px;
    right: 27px;
    color: ${({ theme: { colors } }) => colors.accent};
    font-size: 12px;
    font-weight: 500;
`;
