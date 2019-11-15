import React from 'react';
import styled, { withTheme } from 'styled-components';
import { ms } from '../../styles/helpers';
import TezosIcon from '../TezosIcon';

import { limitLength } from '../../utils/strings';
import { openLinkToBlockExplorer } from '../../utils/general';
import i18n from '../../utils/i18n';

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
  const { firstIconName, operationName, operationId, lastIconName } = props;

  return (
    <Container>
      <InfoIcon size={ms(1)} color="accent" iconName={firstIconName} />
      <ActivationOperation>{operationName}</ActivationOperation>
      <ActivationOperationId>{limitLength(operationId, 17)}</ActivationOperationId>
      <Details
        onClick={() => {
          openLinkToBlockExplorer(operationId);
        }}
      >
        {i18n.t('general.nouns.details')}
      </Details>
      <InfoIcon
        size={ms(1)}
        color="primary"
        iconName={lastIconName}
        onClick={() => openLinkToBlockExplorer(operationId) as any}
      />
    </Container>
  );
}

export default withTheme(Info as any);
