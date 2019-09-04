import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { getNodesStatus } from '../../reduxContent/wallet/selectors';
import { ms } from '../../styles/helpers';
import TezosIcon from '../TezosIcon/';

import { getNodesError } from '../../utils/general';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${ms(-1)} ${ms(3)};
  background-color: ${({ theme: { colors } }) => colors.error1};
  color: ${({ theme: { colors } }) => colors.white};
  font-size: ${ms(-0.5)};
`;

const WarningIcon = styled(TezosIcon)`
  font-size: ${ms(0.5)};
  margin-right: ${ms(-1.5)};
`;

interface OwnProps {
  nodesStatus: any;
}

type Props = OwnProps & WithTranslation;

const NodesStatus = (props: Props) => {
  const { nodesStatus, t } = props;
  const nodesErrorMessage = getNodesError(nodesStatus.toJS());

  return nodesErrorMessage ? (
    <Container>
      <WarningIcon color="white" iconName="warning" />
      <span>{t(nodesErrorMessage)}</span>
    </Container>
  ) : null;
};

const mapStateToProps = state => ({
  nodesStatus: getNodesStatus(state)
});

export default connect(
  mapStateToProps,
  {}
)(withTranslation()(NodesStatus));
