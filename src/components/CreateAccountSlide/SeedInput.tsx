import React, { useState } from 'react';
import Warning from '@material-ui/icons/Warning';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import TextField from '../TextField';
import { ms } from '../../styles/helpers';
import TezosIcon from '../TezosIcon';

const StyledInputContainer = styled.div`
  position: relative;
  height: 103px;
  padding-top: 16px;
  width: 45%;
`;

const CheckIcon = styled(TezosIcon)`
  position: absolute;
  top: 42px;
  right: 5px;
`;

const WarningIcon = styled(Warning)`
  &&& {
    position: absolute;
    right: 12px;
    top: 42px;
    fill: ${({ theme: { colors } }) => colors.error1};
    width: 18px;
    height: 18px;
  }
`;

interface Props {
  value: string;
  index: number;
  onValidate: (isValid: boolean) => void;
}

function SeedInput(props: Props) {
  const { index, value, onValidate } = props;
  const { t } = useTranslation();
  const [isFirst, setIsFirst] = useState(false);
  const [status, setStatus] = useState(0);

  function getLabel() {
    switch (`${index}`) {
      case '1':
        return t('components.createAccountSlide.first_word');
      case '2':
        return t('components.createAccountSlide.second_word');
      case '3':
        return t('components.createAccountSlide.third_word');
      default:
        return t('components.createAccountSlide.nth_word', { index });
    }
  }

  function changFunc(val) {
    if (!isFirst) {
      setIsFirst(true);
    }
    let isValid = false;

    if (val) {
      const isMatching = value.indexOf(val) > -1;
      if (val === value) {
        setStatus(3);
        isValid = true;
      } else if (isMatching) {
        setStatus(2);
      } else {
        setStatus(1);
      }
    } else {
      setStatus(0);
    }
    onValidate(isValid);
  }
  // const keyHandler = ev => {
  //   if (ev.key === 'Enter') {
  //     this.props.onEnter();
  //     ev.preventDefault();
  //   }
  // };

  function getIconAndError() {
    if (!isFirst) {
      return {
        icon: null,
        error: ''
      };
    }

    switch (status) {
      case 0:
        return {
          icon: <WarningIcon />,
          error: 'components.createAccountSlide.errors.typo_error'
        };
      case 1:
        return {
          icon: <WarningIcon />,
          error: 'components.createAccountSlide.errors.invalid_word'
        };
      case 3:
        return {
          icon: <CheckIcon iconName="checkmark2" size={ms(0)} color="check" />,
          error: ''
        };
      default:
        return {
          icon: null,
          error: ''
        };
    }
  }

  const label = getLabel();
  const { icon, error } = getIconAndError();

  return (
    <StyledInputContainer>
      <TextField label={label} onChange={newVal => changFunc(newVal)} errorText={t(error)} />
      {icon}
    </StyledInputContainer>
  );
}

export default SeedInput;
