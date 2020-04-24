import React from 'react';
import { clipboard } from 'electron';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@material-ui/icons/Close';
import ContentCopy from '@material-ui/icons/FileCopyOutlined';
import { IconButton } from '@material-ui/core';
import styled from 'styled-components';
import { ms } from '../../styles/helpers';
import TezosIcon from '../TezosIcon/';

const MessageContainer = styled.div<{ isError: boolean }>`
    padding: 25px 30px 30px 30px;
    background-color: ${({ isError }) => (isError ? 'rgba(255, 0, 0, 0.9)' : 'rgba(37, 156, 144, 0.9)')};
    width: 100%;
    color: ${({ theme: { colors } }) => colors.white};
`;
const StyledCloseIcon = styled(CloseIcon)`
    cursor: pointer;
    position: absolute;
    width: 20px !important;
    height: 20px !important;
    top: 10px;
    right: 10px;
    fill: #ffffff !important;
`;
const CheckIcon = styled(TezosIcon)`
    margin-right: 13px;
`;
const BroadIcon = styled(TezosIcon)`
    margin-left: 2px;
`;
const MessageHeader = styled.div<{ isWrap: boolean }>`
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
    font-weight: 500;
    letter-spacing: 1.1px;
    white-space: ${({ isWrap }) => (!isWrap ? 'normal' : 'nowrap')};
`;
const MessageFooter = styled.div`
    display: flex;
    justify-content: center;
    align-items: baseline;
    line-height: 16px;
    padding-top: 16px;
`;
const LinkContainer = styled.div`
    display: flex;
    align-items: center;
    margin-left: 7px;
    cursor: pointer;
`;
const LinkTitle = styled.div`
    font-size: 12px;
    text-decoration: underline;
`;
const HashValue = styled.div`
    font-size: 12px;
    margin-left: 5px;
`;
const HashTitle = styled.div`
    font-size: 10px;
    font-weight: 500;
`;
const IconButtonWrapper = styled(IconButton)`
    &&& {
        color: ${({ theme: { colors } }) => colors.white};
        margin-left: 3px;
        position: relative;
        top: 3px;
    }
`;

const CopyIconWrapper = styled(ContentCopy)`
    &&& {
        width: 15px;
        height: 15px;
    }
`;

interface Props {
    content: string;
    hash: string;
    realHash: string;
    isError: boolean;
    localeParam: number;
    openLink: () => void;
    onClose: () => void;
}

const MessageContent = (props: Props) => {
    const { content, realHash, hash, openLink, onClose, isError, localeParam } = props;
    const { t } = useTranslation();

    function copyToClipboard() {
        try {
            clipboard.writeText(realHash);
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <MessageContainer isError={isError}>
            <StyledCloseIcon onClick={() => onClose()} />
            <MessageHeader isWrap={content !== 'general.errors.no_ledger_detected'}>
                {!!hash && <CheckIcon iconName="checkmark2" size={ms(0)} color="white" />}
                {t(content, { localeParam })}
            </MessageHeader>
            {/* {!!hash && <LinkButton onClick={openLink}>See it on chain</LinkButton>} */}
            {!!hash && (
                <MessageFooter>
                    <HashTitle>{t('components.messageBar.operation_id')}:</HashTitle>
                    <HashValue>{hash}</HashValue>
                    <LinkContainer onClick={() => openLink()}>
                        <LinkTitle>{t('components.messageBar.view_block_explorer')}</LinkTitle>
                        <BroadIcon iconName="new-window" size={ms(0)} color="white" />
                    </LinkContainer>
                    <IconButtonWrapper size="small" onClick={() => copyToClipboard()}>
                        <CopyIconWrapper />
                    </IconButtonWrapper>
                </MessageFooter>
            )}
        </MessageContainer>
    );
};

export default MessageContent;
