import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { ms } from '../../styles/helpers';
import TezosIcon from '../TezosIcon';
import { limitLength } from '../../utils/strings';
import { openBlockExplorerForOperation } from '../../utils/general';
import { RootState } from '../../types/store';
import { getMainNode } from '../../utils/settings';

const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${ms(-2)};
`;

const InfoIcon = styled(TezosIcon)`
    font-size: ${ms(-1)};
    cursor: pointer;
`;

const ActivationOperation = styled.div`
    color: ${({ theme: { colors } }) => colors.accent};
    text-transform: uppercase;
    margin-left: 5px;
    margin-right: 5px;
    white-space: nowrap;
`;

const ActivationOperationId = styled.div`
    color: #4a4a4a;
    margin-right: 10px;
`;

const Details = styled.div`
    color: ${({ theme: { colors } }) => colors.primary};
    margin-right: 5px;
    cursor: pointer;
`;

interface Props {
    firstIconName: string;
    operationName: string;
    operationId: string;
    lastIconName: string;
}

function Info(props: Props) {
    const { t } = useTranslation();
    const { firstIconName, operationName, operationId, lastIconName } = props;
    const settings = useSelector<RootState, any>((state: RootState) => state.settings);
    const { selectedNode, nodesList } = settings;
    const currentNode = getMainNode(nodesList, selectedNode);

    return (
        <Container>
            <InfoIcon size={ms(1)} color="accent" iconName={firstIconName} />
            <ActivationOperation>{operationName}</ActivationOperation>
            <ActivationOperationId>{limitLength(operationId, 17)}</ActivationOperationId>
            <Details
                onClick={() => {
                    openBlockExplorerForOperation(operationId, currentNode.network);
                }}
            >
                {t('general.nouns.details')}
            </Details>
            <InfoIcon size={ms(1)} color="primary" iconName={lastIconName} onClick={() => openBlockExplorerForOperation(operationId)} />
        </Container>
    );
}

export default Info;
