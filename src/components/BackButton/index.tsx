import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import styled from 'styled-components';
import BackCaret from '@material-ui/icons/KeyboardArrowLeft';

const Back = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme: { colors } }) => colors.blue3};
  cursor: pointer;
`;

interface OwnProps {
  onClick: () => void;
}

type Props = OwnProps & WithTranslation;

function BackButton(props: Props) {
  const { onClick, t } = props;
  return (
    <Back onClick={onClick}>
      <BackCaret
        style={{
          fill: '#4486f0',
          marginRight: '8px'
        }}
      />
      <span>{t('general.back')}</span>
    </Back>
  );
}

export default withTranslation()(BackButton);
