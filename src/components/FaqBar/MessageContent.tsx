import React from 'react';
import { Trans } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';

import styled from 'styled-components';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const MessageContainer = styled.div`
    padding: 12px 10px 12px 18px;
    background-color: #1a315f;
    width: 100%;
    color: ${({ theme: { colors } }) => colors.white};
`;

const StyledCloseIcon = styled(CloseIcon)`
    cursor: pointer;
    position: absolute;
    width: 15px !important;
    height: 15px !important;
    top: 10px;
    right: 10px;
    fill: #ffffff !important;
`;

const MessageHeader = styled.div<{ isWrap?: boolean }>`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font-size: 18px;
    font-weight: 500;
    letter-spacing: 1.1px;
    white-space: ${({ isWrap }) => (!isWrap ? 'normal' : 'nowrap')};
`;

const DesText = styled.div`
    font-size: 16px;
    margin-left: 14px;
    margin-right: 200px;
    line-height: 19px;
    font-weight: 300;
`;

const InfoIcon = styled(InfoOutlinedIcon)`
    transform: rotate(180deg);
`;

const Link = styled.span`
    cursor: pointer;
    color: ${({ theme: { colors } }) => colors.white};
    text-decoration: underline;
`;

interface Props {
    openLink: (link?: string) => void;
    onClose: () => void;
}

const MessageContent = (props: Props) => {
    const { openLink, onClose } = props;
    return (
        <MessageContainer>
            <StyledCloseIcon onClick={() => onClose()} />
            <MessageHeader>
                <InfoIcon />
                <DesText>
                    <Trans i18nKey="components.faq.description">
                        Please visit our FAQ
                        <Link onClick={() => openLink()}>FAQ</Link>
                        for questions about app features.
                    </Trans>
                </DesText>
            </MessageHeader>
        </MessageContainer>
    );
};

export default MessageContent;
