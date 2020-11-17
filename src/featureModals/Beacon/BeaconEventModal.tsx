import React, { useState, useEffect } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ms } from '../../styles/helpers';
import { openLink } from '../../utils/general';
import { getMainNode, getMainPath } from '../../utils/settings';
import Loader from '../../components/Loader';
import Tooltip from '../../components/Tooltip';
import { RootState } from '../../types/store';

import {
    ModalWrapper,
    ModalContainer,
    CloseIconWrapper,
    ModalTitle,
    Container,
    MainContainer,
    ButtonContainer,
    ResultContainer,
    InvokeButton,
    Result,
    LinkIcon,
    LinkContainer,
    ContentTitle,
    ContentSubtitle,
    Footer,
    TitleContainer,
    TooltipContent,
} from '../style';

export const PromptContainer = styled.div`
    align-items: center;
    color: #979797;
    display: flex;
    font-size: 24px;
    justify-content: center;
    height: 80px;
    margin-top: 30px;
    width: 100%;
`;

interface Props {
    open: boolean;
    onClose: () => void;
}

const BeaconEventModal = (props: Props) => {
    const { t } = useTranslation();
    const { isLoading, selectedParentHash, signer } = useSelector((rootState: RootState) => rootState.app, shallowEqual);
    const activeModal = useSelector<RootState, string>((state: RootState) => state.modal.activeModal);
    const values = useSelector<RootState, object>((state) => state.modal.values, shallowEqual);
    const { settings } = useSelector((rootState: RootState) => rootState, shallowEqual);

    const { open, onClose } = props;

    const [result, setResult] = useState('');
    const [error, setError] = useState(false);
    const [requestor, setRequestor] = useState('');
    const [operationAmount, setOperationAmount] = useState(0);
    const [operationParams, setOperationParams] = useState('');
    const [operationTarget, setOperationTarget] = useState('');
    const [prompt, setPrompt] = useState('');

    const connectedBlockchainNode = getMainNode(settings.nodesList, settings.selectedNode);
    const isDisabled = isLoading || !prompt;

    useEffect(() => {
        const req = values[activeModal];
        console.log(req);

        if (connectedBlockchainNode.network !== req.network.type) {
            // TODO: error network mismatch
        }

        // TODO: validate req.senderId against local list, see BeaconInfoModal for details

        setRequestor(req.appMetadata.name);
        setOperationAmount(Number(req.operationDetails[0].amount));
        // req.operationDetails[0].kind "transaction"
        // setTrasactionParams();
        setOperationTarget(req.operationDetails[0].destination);

        // type: "operation_request"
    }, []);

    const onApprove = async () => {
        //
    };

    return (
        <ModalWrapper open={open}>
            {open ? (
                <ModalContainer>
                    <CloseIconWrapper onClick={() => onClose()} />
                    <ModalTitle>{t('components.Beacon.eventModal.title')}</ModalTitle>
                    <Container>
                        {requestor} is requesting a {operationParams.length > 0 ? 'contract call' : 'simple transaction'} to be executed to send{' '}
                        {operationAmount > 0 ? (operationAmount / 1_000_000).toFixed(6) : ''} {operationParams.length > 0 ? 'with the following' : 'without'}{' '}
                        {operationParams.length > 0 ? operationParams : ''} parameters to {operationTarget}.
                    </Container>
                    {isLoading && <Loader />}
                    <Footer>
                        <ButtonContainer>
                            <InvokeButton buttonTheme="primary" onClick={onApprove}>
                                {t('general.verbs.approve')}
                            </InvokeButton>
                        </ButtonContainer>
                    </Footer>
                </ModalContainer>
            ) : (
                <ModalContainer />
            )}
        </ModalWrapper>
    );
};

export default BeaconEventModal;
