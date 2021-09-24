import styled from 'styled-components';
import Modal from '@mui/material/Modal';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CloseIcon from '@mui/icons-material/Close';
import Warning from '@mui/icons-material/Warning';

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
    .modal-holder {
        text-align: center !important;
        padding: 40px 48px 3px 48px;
        h3 {
            font-size: 24px;
            font-weight: 300;
            margin: 0 0 10px;
            color: #123262;
        }
        .text-center {
            text-align: center !important;
        }
        .mr-t-100 {
            margin-top: 100px;
        }
        .divider {
            height: 2px;
            background-color: #ccc;
            margin: 0 10px;
            width: 60px;
            display: inline-block;
            vertical-align: super;
        }
        h4 {
            font-size: 16px;
            font-weight: 500;
            color: #5571a7;
            margin: 5px 0 8px 0;
        }
        p {
            font-size: 16px;
            color: #123262;
            font-weight: 300;
            text-align: left;
            margin: 0 0 10px;
        }
        .linkAddress {
            font-size: 16px;
            font-weight: 600;
            color: #123262;
            margin-bottom: 16px;
            margin-top: 0;
            text-align: center;
        }
        ul {
            padding-left: 16px;
            margin-bottom: 10px;
        }
        li {
            font-size: 14px;
            font-weight: 300;
            color: #000;
            text-align: left;
        }
        .subtitleText {
            font-size: 14px;
            font-weight: 300;
            color: #5571a7;
        }
        .inputField {
            width: 100%;
            height: 120px;
            resize: none;
            border: 1px solid #e0e0e0;
            margin-bottom: 1px;
        }
        .inputLabel {
            font-weight: 400;
            color: rgba(0, 0, 0, 0.38);
            font-size: 12px;
        }
        ,
        .feeContainer {
            margin-top: 3px;
            margin-bottom: 3px;
        }
    }
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
    margin-right: auto;
`;

export const WhiteBtn = styled(Button)`
    width: 194px;
    height: 50px;
    margin-left: auto;
    padding: 0;
    cursor: default;
    background: #fff !important;
    color: #2c7df7 !important;
    border: 2px solid #2c7df7 !important;
    font-weight: 400;
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
    background: #f7f9fb;
    margin: auto 0 0;
    padding: 25px 0;
    display: flex;
    flex-direction: column;
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

export const Keys = styled.div`
    padding: 25px 36px 50px;
`;

export const KeyWrapper = styled.div`
    display: flex;
    flex-direction: column;
    padding: 10px 0px;
`;

export const KeyTitle = styled.h4`
    margin: 5px 0;
    font-size: 18px;
    color: #7691c4;
`;

export const SecretKeyMessage = styled.div`
    display: flex;
    justify-content: center;
    align-items: flex-start;
    width: 100%;
    padding: 20px 40px 0px;
    color: #4e71ab;
    font-weight: 300;
`;

export const KeyAddress = styled.div`
    word-wrap: break-word;
    font-weight: 300;
    color: #123262;
`;

export const InfoIcon = styled(TezosIcon)`
    font-size: ${ms(2)};
    padding: 1px 7px 0px 0px;
`;

export const SuccessIcon = styled(TezosIcon)`
    font-size: ${ms(1)};
    margin-right: 5px;
`;

export const BeaconNotConnected = styled.div`
    display: flex;
    flex-direction: column;
    .message {
        font-weight: 300;
        font-size: 18px;
        line-height: 11px;
        color: #123262;
        opacity: 0.78;
        margin-top: 40px;
    }
    .info {
        line-height: 22px;
        color: #333333;
        margin-top: 16px;
    }
    .img {
        margin-top: 50px;
        margin-bottom: 120px;
        flex-align: center;
    }
`;

export const BeaconConnected = styled.div`
    display: flex;
    border-bottom: 1px solid #e0e0e0;
    margin-top: 17px;
    padding-bottom: 40px;
    .img {
        width: 64px;
        height: 64px;
        border: 1px solid #000000;
        border-radius: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .list {
        margin-left: 24px;
    }
    .name {
        font-weight: 500;
        line-height: 19px;
    }
    .item {
        line-height: 19px;
        margin-top: 8px;
    }
`;

export const BeaconInfoContainer = styled.div`
    padding: 0 32px;
    .title {
        font-weight: 500;
        font-size: 18px;
        line-height: 21px;
        margin-top: 24px;
    }
    .items {
        max-height: 480px;
        overflow-y: scroll;
    }
`;

export const AddressInfoLink = styled.a``;
