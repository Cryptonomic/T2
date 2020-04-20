import React, { useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import SwipeableViews from 'react-swipeable-views';
import { useTranslation } from 'react-i18next';

import CloseIcon from '@material-ui/icons/Close';
import { Modal, Tabs, Tab } from '@material-ui/core';
import Loader from '../../components/Loader';
import Sign from './components/Sign';
import Verify from './components/Verify';

import { RootState } from '../../types/store';

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

interface Props {
    open: boolean;
    onClose: () => void;
}

function SignVerifyModal(props: Props) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(0);
    const [enterCounts, setEnterCounts] = useState<number[]>([0, 0]);
    const isLoading = useSelector<RootState, boolean>((state: RootState) => state.app.isLoading);
    const { open, onClose } = props;

    function onEnterPress(event) {
        if (event.key === 'Enter') {
            enterCounts[activeTab] += 1;
            setEnterCounts(enterCounts);
        }
    }

    return (
        <ModalWrapper open={open} onKeyDown={onEnterPress}>
            {open ? (
                <ModalContainer>
                    <CloseIconWrapper onClick={() => onClose()} />
                    <ModalTitle>{t('general.nouns.sign_n_verify')}</ModalTitle>
                    <TabsWrapper value={activeTab} onChange={(e, val) => setActiveTab(val)} variant="fullWidth" textColor="primary">
                        <TabWrapper label={t('general.verbs.sign')} />
                        <TabWrapper label={t('general.verbs.verify')} />
                    </TabsWrapper>

                    <SwipeableViews index={activeTab}>
                        <Sign />
                        <Verify />
                    </SwipeableViews>
                    {isLoading && <Loader />}
                </ModalContainer>
            ) : (
                <ModalContainer />
            )}
        </ModalWrapper>
    );
}

export default SignVerifyModal;
