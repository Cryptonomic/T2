import React from 'react';
import styled from 'styled-components';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import FormControl from '@material-ui/core/FormControl';
import TezosIcon from '../TezosIcon';
import { ms } from '../../styles/helpers';
import { withTranslation, WithTranslation } from 'react-i18next';

const focusBorderColors = ['#2c7df7', '#ea776c', '#e69940', '#d3b53b', '#259c90'];

const Container = styled.div`
  position: relative;
`;
const Content = styled(FormControl)`
  width: 100%;
`;

const InputWrapper = styled(Input)<{ width: string; score: number }>`
  &&& {
    &[class*='focused'] {
      &:before {
        border-bottom: solid 2px rgba(0, 0, 0, 0.22);
      }
      &:after {
        width: ${({ width }) => width};
        border-bottom-color: ${({ score }) => focusBorderColors[score]};
      }
    }
    color: ${({ theme: { colors } }) => colors.primary};
    font-size: 16px;
    font-weight: 300;

    &:before {
      border-bottom: solid 1px rgba(0, 0, 0, 0.12);
    }
    &:hover:before {
      border-bottom: solid 2px rgba(0, 0, 0, 0.22) !important;
    }
  }
}`;
const LabelWrapper = styled(InputLabel)`
  &&& {
    &[class*='focused'] {
      color: ${({ theme: { colors } }) => colors.gray3};
    }
    color: rgba(0, 0, 0, 0.38);
    font-size: 16px;
  }
}`;

const PasswordStrengthSuggestions = styled.div`
  height: 3.3rem;
  width: 24rem;
`;
const Suggestion = styled.div`
  font-size: 12px;
  line-height: 18px;
  color: #92949a;
  max-width: 438px;
  span {
    font-weight: bold;
  }
`;
const Error = styled.div`
  font-size: 12px;
  line-height: 18px;
  color: ${props => props.color};
`;

const ShowHidePwd = styled.div`
  color: ${({ theme: { colors } }) => colors.accent};
  font-size: 12px;
  font-weight: 500;
`;
const CheckIcon = styled(TezosIcon)`
  margin-right: 3px;
`;

const CheckContainer = styled.div`
  position: absolute;
  right: 10px;
  top: 26px;
  display: flex;
`;

interface OwnProps {
  label: string;
  error: string;
  suggestion?: string;
  isShowed: boolean;
  status?: boolean;
  score: number;
  changFunc: (val: string) => void;
  onShow: () => void;
}

type Props = OwnProps & WithTranslation;

function InputValid(props: Props) {
  const { label, error, suggestion, score, status, isShowed, changFunc, onShow, t } = props;
  const borderColor = focusBorderColors[score];
  let width = '';
  if (score && !status) {
    width = `${score * 25}%`;
  } else {
    width = `100%`;
  }

  return (
    <Container>
      <Content>
        <LabelWrapper>{label}</LabelWrapper>
        <InputWrapper
          key={label}
          type={isShowed ? 'text' : 'password'}
          onChange={event => changFunc(event.target.value)}
          width={width}
          score={score}
        />
      </Content>
      <CheckContainer>
        {score === 4 && (
          <CheckIcon iconName="checkmark2" size={ms(0)} color="check" onClick={onShow} />
        )}
        <ShowHidePwd onClick={onShow} style={{ cursor: 'pointer' }}>
          {t(isShowed ? 'general.verbs.hide' : 'general.verbs.show')}
        </ShowHidePwd>
      </CheckContainer>

      <PasswordStrengthSuggestions>
        {!!error && <Error color={borderColor}>{error}</Error>}
        {!!suggestion && <Suggestion dangerouslySetInnerHTML={{ __html: suggestion }} />}
      </PasswordStrengthSuggestions>
    </Container>
  );
}
InputValid.defaultProps = {
  error: '',
  suggestion: '',
  score: 0,
  isShowed: false,
  status: false
};

export default withTranslation()(InputValid);
