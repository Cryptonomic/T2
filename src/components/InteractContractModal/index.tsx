import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { OperationKindType } from 'conseiljs';
import { useTranslation } from 'react-i18next';

import TabPanel from '../TabPanel';
import Loader from '../Loader';
import DeployContract from './DeployContract';
import InvokeContract from './InvokeContract';

import { useFetchFees } from '../../reduxContent/app/thunks';
import { ModalWrapper, ModalContainer, ModalTitle, CloseIconWrapper, TabsWrapper, TabWrapper } from './style';
import { RootState } from '../../types/store';
import { RegularAddress } from '../../types/general';

interface Props {
    addresses: RegularAddress[];
    open: boolean;
    onClose: () => void;
}

function InteractContractModal(props: Props) {
    // TODO: move to featureModals
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(0);
    const [enterCounts, setEnterCounts] = useState<number[]>([0, 0]);
    const { newFees } = useFetchFees(OperationKindType.Transaction, false);
    const isLoading = useSelector<RootState, boolean>((state: RootState) => state.app.isLoading);
    const { open, addresses, onClose } = props;

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
                    <ModalTitle>{t('components.interactModal.title')}</ModalTitle>
                    <TabsWrapper value={activeTab} onChange={(e, val) => setActiveTab(val)} variant="fullWidth" textColor="primary">
                        <TabWrapper label={t('components.interactModal.invoke_contract')} />
                        <TabWrapper label={t('components.interactModal.deploy_contract')} />
                    </TabsWrapper>
                    <TabPanel value={activeTab} index={0}>
                        <InvokeContract enterNum={enterCounts[0]} addresses={addresses} averageFees={newFees} onClose={onClose} />
                    </TabPanel>
                    <TabPanel value={activeTab} index={1}>
                        <DeployContract enterNum={enterCounts[1]} addresses={addresses} averageFees={newFees} onClose={onClose} />
                    </TabPanel>
                    {isLoading && <Loader />}
                </ModalContainer>
            ) : (
                <ModalContainer />
            )}
        </ModalWrapper>
    );
}

export default InteractContractModal;
