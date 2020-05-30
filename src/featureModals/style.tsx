import styled from 'styled-components';
import Modal from '@material-ui/core/Modal';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CloseIcon from '@material-ui/icons/Close';
import Warning from '@material-ui/icons/Warning';

import TezosIcon from '../components/TezosIcon';
import Button from '../components/Button';
import { ms } from '../styles/helpers';

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
    padding-bottom: 50px 50px 0px;
`;

export const MainContainer = styled.div`
    width: 100%;
    padding-top: 25px;
    padding-left: 40px;
    padding-right: 40px;
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
    flex: ${(props) => (!props.error ? 1 : '')};
    width: ${(props) => (!props.error ? '90%' : '')};
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
    cursor: default;
`;

export const LinkIcon = styled(TezosIcon)`
    margin-left: 2px;
    cursor: pointer;
`;

export const LinkContainer = styled.div`
    display: inline-block;
    cursor: pointer;
`;

export const TitleContainer = styled.div`
    font-weight: 300;
    line-height: 34px;
    color: ${({ theme: { colors } }) => colors.primary};
    letter-spacing: 1px;
    margin-bottom: 32px;
`;

export const ContentTitle = styled.div`
    font-size: 24px;
`;

export const ContentSubtitle = styled.div`
    font-size: 18px;
`;

export const Footer = styled.div`
    background: ${({ theme: { colors } }) => colors.gray7}
    margin: auto 0 0;
    padding: 25px 0;
    display: flex;
    flex-direction: column
`;

export const TooltipContent = styled.div`
    color: ${({ theme: { colors } }) => colors.primary};
    font-weight: 300;
    font-size: ${ms(-1)};
    max-width: ${ms(13)};
`;

export const MessageContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: flex-start;
    height: 60px;
    width: 100%;
    padding: 40px 40px 0px 40px;
    color: #4e71ab;
    font-weight: 300;
`;

export const InfoContainer = styled.div`
    display: flex;
    justify-content: left;
    align-items: center;
    height: 60px;
    width: 100%;
`;

export const InfoIcon = styled(TezosIcon)`
    font-size: ${ms(2)};
    padding: 1px 7px 0px 0px;
`;

export const SuccessIcon = styled(TezosIcon)`
    font-size: ${ms(1)};
    margin-right: 5px;
`;
