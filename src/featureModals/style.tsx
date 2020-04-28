import styled from 'styled-components';
import { Modal, Tabs, Tab } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import Warning from '@material-ui/icons/Warning';

import Button from '../components/Button';

export const ModalWrapper = styled(Modal)`
    &&& {
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;

export const ModalContainer = styled.div`
    background-color: ${({ theme: { colors } }) => colors.white};
    outline: none;
    position: relative;
    min-width: 671px;
    max-width: 750px;
    width: 672px;
`;

export const CloseIconWrapper = styled(CloseIcon)`
    &&& {
        fill: ${({ theme: { colors } }) => colors.white};
        cursor: pointer;
        height: 20px;
        width: 20px;
        position: absolute;
        top: 23px;
        right: 23px;
    }
`;

export const ModalTitle = styled.div`
    padding: 27px 36px;
    font-size: 24px;
    letter-spacing: 1px;
    line-height: 34px;
    font-weight: 300;
    color: ${({ theme: { colors } }) => colors.white};
    width: 100%;
    background-color: ${({ theme: { colors } }) => colors.accent};
`;

export const TabsWrapper = styled(Tabs)`
    .MuiTabs-indicator {
        background-color: ${({ theme: { colors } }) => colors.white};
        display: none;
    }
`;

export const TabWrapper = styled(Tab)`
    &.MuiTab-root {
        height: 60px;
        background-color: ${({ theme: { colors } }) => colors.accent};
        color: ${({ theme: { colors } }) => colors.white};
        text-transform: initial;
        font-size: 16px;
        font-weight: 500;
    }
    &.Mui-selected {
        background-color: ${({ theme: { colors } }) => colors.white};
    }
`;

export const Container = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    padding-bottom: 50px;
`;

export const MainContainer = styled.div`
    width: 100%;
    padding: 40px 40px 30px 40px;
`;

export const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60px;
    margin-top: auto;
    padding: 0 40px;
`;

export const ResultContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60px;
    width: 100%;
    padding: 0 40px;
`;

export const Result = styled.div<any>`
    flex: ${props => (!props.error ? 1 : '')};
    width: ${props => (!props.error ? '90%' : '')};
    word-wrap: break-word;
`;

export const WarningIcon = styled(Warning)`
    &&& {
        fill: ${({ theme: { colors } }) => colors.error1};
        margin-right: 5px;
    }
`;

export const InvokeButton = styled(Button)`
    width: 194px;
    height: 50px;
    margin-left: auto;
    padding: 0;
`;
