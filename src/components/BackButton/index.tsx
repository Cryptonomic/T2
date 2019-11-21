import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import ArrowLeft from '@material-ui/icons/KeyboardArrowLeft';

const Back = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme: { colors } }) => colors.blue3};
  cursor: pointer;
  font-size: 17px;
  max-width: 70px;
`;

const BackCaret = styled(ArrowLeft)`
  margin: 0 5px 0 -9px;
  height: 28px;
  width: 28px;
`;

interface OwnProps {
  onClick?: () => void;
}

type Props = OwnProps & WithTranslation;

function BackButton(props: Props) {
  const history = useHistory();
  const { onClick, t } = props;
  function goBack() {
    if (!onClick) {
      history.goBack();
    } else {
      onClick();
    }
  }
  return (
    <Back onClick={goBack}>
      <BackCaret />
      <span>{t('general.back')}</span>
    </Back>
  );
}

export default withTranslation()(BackButton);
