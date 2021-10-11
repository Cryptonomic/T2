import React from 'react';
import styled from 'styled-components';
import InputLabel from '@mui/material/InputLabel';
import Input from '@mui/material/Input';
import FormControl from '@mui/material/FormControl';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircle from '@mui/icons-material/CheckCircle';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';

import { useTranslation } from 'react-i18next';

function getBorderColors(score) {
    switch (score) {
        case 0:
            return '#2c7df7';
        case 4:
            return '#4EB020';
        default:
            return '#ea776c';
    }
}

const Container = styled.div`
    position: relative;
`;
const Content = styled(FormControl)`
    width: 100%;
`;

const InputWrapper = styled(Input)<{ score: number }>`
  &&& {
    &.MuiInput-underline {
        &:hover:not(.Mui-disabled):before {
            border-bottom-color: ${({ score }) => getBorderColors(score)};
        }
        &:after {
            border-bottom-color: ${({ score }) => getBorderColors(score)};
        }
        
    }
    &.MuiInput-focused {
        &:hover:not(.Mui-disabled):before {
            border-bottom-color: ${({ score }) => getBorderColors(score)};
        }
        &:after {
            border-bottom-color: ${({ score }) => getBorderColors(score)};
        }
    }
    
    color: ${({ theme: { colors } }) => colors.primary};
    font-size: 16px;
    font-weight: 300;
  }
}`;
const LabelWrapper = styled(InputLabel)`
  &&& {
    &.MuiInput-focused {
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
    color: ${(props) => props.color};
`;

const ShowHidePwd = styled.div`
    color: ${({ theme: { colors } }) => colors.accent};
    font-size: 12px;
    font-weight: 500;
`;
const CheckIcon = styled(CheckCircle)`
    &&& {
        margin-right: 3px;
        fill: #4eb020;
        width: 21px;
        height: 21px;
        position: relative;
        top: 2px;
    }
`;

const CancelIcon = styled(CancelRoundedIcon)`
    &&& {
        margin-right: 3px;
        fill: #ea776c;
        width: 21px;
        height: 21px;
        position: relative;
        top: 2px;
    }
`;

const CheckContainer = styled.div<{ visibilityIcon?: boolean }>`
    position: absolute;
    right: 10px;
    top: ${({ visibilityIcon }) => (visibilityIcon ? '20px' : '26px')};
    display: flex;
`;

interface Props {
    label: string;
    error: string;
    suggestion?: string;
    isShowed: boolean;
    status?: boolean;
    score: number;
    visibilityIcon?: boolean | undefined;
    changFunc: (val: string) => void;
    onShow: () => void;
}

function InputValid(props: Props) {
    const { t } = useTranslation();
    const { label, error, suggestion, score, status, isShowed, changFunc, onShow, visibilityIcon } = props;
    const borderColor = getBorderColors(score);

    function getIcon(val) {
        switch (val) {
            case 0:
                return null;
            case 4:
                return <CheckIcon />;
            default:
                return <CancelIcon />;
        }
    }

    return (
        <Container>
            <Content>
                <LabelWrapper variant="standard">{label}</LabelWrapper>
                <InputWrapper key={label} type={isShowed ? 'text' : 'password'} onChange={(event) => changFunc(event.target.value)} score={score} />
            </Content>
            <CheckContainer visibilityIcon={true}>
                {getIcon(score)}
                <ShowHidePwd onClick={onShow} style={{ cursor: 'pointer' }}>
                    {visibilityIcon && (isShowed ? <VisibilityIcon color="secondary" /> : <VisibilityIcon color="action" />)}
                    {!visibilityIcon && t(isShowed ? 'general.verbs.hide' : 'general.verbs.show')}
                </ShowHidePwd>
            </CheckContainer>

            <PasswordStrengthSuggestions>
                {!!error && <Error color={borderColor}>{error}</Error>}
                {!!suggestion && <Suggestion>suggestion</Suggestion>}
            </PasswordStrengthSuggestions>
        </Container>
    );
}
InputValid.defaultProps = {
    error: '',
    suggestion: '',
    score: 0,
    isShowed: false,
    status: false,
};

export default InputValid;
