import React, { useState } from 'react';
import styled from 'styled-components';
import { withTranslation, WithTranslation } from 'react-i18next';
import TextField from '../TextField';

const Container = styled.div`
  position: relative;
`;

const ShowHidePwd = styled.div`
  position: absolute;
  right: 10px;
  top: 22px;
  color: ${({ theme: { colors } }) => colors.accent};
  font-size: 12px;
  font-weight: 500;
`;

interface OwnProps {
  label: string;
  containerStyle?: object;
  password: string;
  changFunc: (val: string) => void;
}

type Props = OwnProps & WithTranslation;

function PasswordInput(props: Props) {
  const { label, password, changFunc, containerStyle, t } = props;
  const [isShowed, setIsShowed] = useState(false);
  return (
    <Container style={containerStyle}>
      <TextField
        label={label}
        type={isShowed ? 'text' : 'password'}
        value={password}
        onChange={(newVal: string) => changFunc(newVal)}
        right={42}
      />
      <ShowHidePwd style={{ cursor: 'pointer' }} onClick={() => setIsShowed(!isShowed)}>
        {t(isShowed ? 'general.verbs.hide' : 'general.verbs.show')}
      </ShowHidePwd>
    </Container>
  );
}

PasswordInput.defaultProps = {
  containerStyle: {}
};

export default withTranslation()(PasswordInput);
