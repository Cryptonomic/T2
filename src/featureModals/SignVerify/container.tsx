import React, { useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Loader from '../../components/Loader';
import Sign from './components/Sign';
import Verify from './components/Verify';
import TabPanel from '../../components/TabPanel';

import { setModalActiveTab } from '../../reduxContent/modal/actions';

import { RootState, ModalState } from '../../types/store';

import { ModalWrapper, ModalContainer, CloseIconWrapper, ModalTitle, TabsWrapper, TabWrapper } from '../style';

interface Props {
    open: boolean;
    onClose: () => void;
}

function SignVerifyModal(props: Props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [enterCounts, setEnterCounts] = useState<{}>({});
    const isLoading = useSelector<RootState, boolean>((state: RootState) => state.app.isLoading);
    const activeTab = useSelector<RootState, string | null>((state: RootState) => state.modal.activeTab);
    const { tabs } = useSelector<RootState, ModalState>(state => state.modal, shallowEqual);
    const { open, onClose } = props;
    const swipeIndex = tabs.findIndex((type: string) => type === activeTab);

    function onEnterPress(event) {
        if (event.key === 'Enter' && activeTab) {
            enterCounts[activeTab] += 1;
            setEnterCounts(enterCounts);
        }
    }

    function onTabChange(value) {
        dispatch(setModalActiveTab(value));
    }

    return (
        <ModalWrapper open={open} onKeyDown={onEnterPress}>
            {open ? (
                <ModalContainer>
                    <CloseIconWrapper onClick={() => onClose()} />
                    <ModalTitle>{t('general.nouns.sign_n_verify')}</ModalTitle>
                    <TabsWrapper value={activeTab} onChange={(e, val) => onTabChange(val)} variant="fullWidth" textColor="primary">
                        <TabWrapper label={t('general.verbs.sign')} value="sign" />
                        <TabWrapper label={t('general.verbs.verify')} value="verify" />
                    </TabsWrapper>
                    <TabPanel value={swipeIndex} index={0}>
                        <Sign />
                    </TabPanel>
                    <TabPanel value={swipeIndex} index={1}>
                        <Verify />
                    </TabPanel>
                    {isLoading && <Loader />}
                </ModalContainer>
            ) : (
                <ModalContainer />
            )}
        </ModalWrapper>
    );
}

export default SignVerifyModal;
