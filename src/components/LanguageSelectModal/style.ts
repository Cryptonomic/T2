import styled from 'styled-components';
import { RadioGroup, Radio, FormControlLabel } from '@mui/material';
import { CheckCircle, PanoramaFishEye as Circle } from '@mui/icons-material';
import Button from '../Button';

export const ModalContent = styled.div`
    position: absolute;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    bottom: 0;
    background-color: ${({ theme: { colors } }) => colors.white};
    outline: none;
`;

export const Container = styled.div`
    width: 508px;
    padding: 40px 0;
`;

export const Title = styled.div`
    color: ${({ theme: { colors } }) => colors.primary};
    font-weight: 400;
    font-size: 36px;
    line-height: 40px;
    letter-spacing: 0.1px;
`;

export const Description = styled.div`
    color: ${({ theme: { colors } }) => colors.primary};
    font-weight: 300;
    font-size: 18px;
    letter-spacing: 0.1px;
    margin: 14px 0 23px 0;
`;

export const MainContainer = styled.div`
    display: flex;
    justify-content: space-between;
`;

export const LanguageLogo = styled.img`
    width: 155px;
    height: 155px;
`;

export const GroupContainerWrapper = styled.div`
    width: 287.7px;
    height: 200px;
    position: relative;
`;

const FadeOut = styled.div`
    position: absolute;
    width: 92%;
    height: 30px;
    pointer-events: none;
`;

export const FadeTop = styled(FadeOut)`
    top: 0;
    background-image: linear-gradient(to top, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 50%);
`;

export const FadeBottom = styled(FadeOut)`
    bottom: 0;
    background-image: linear-gradient(rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 50%);
`;

export const RadioGroupContainer = styled(RadioGroup)`
    &&& {
        width: 100%;
        height: 100%;
        overflow: auto;
        display: block;
        &::-webkit-scrollbar {
            width: 4px;
        }
        &::-webkit-scrollbar-track {
            background: ${({ theme: { colors } }) => colors.gray2};
        }

        &::-webkit-scrollbar-thumb {
            background: ${({ theme: { colors } }) => colors.accent};
            border-radius: 4px;
        }
    }
`;

export const FormControlLabelWrapper = styled(FormControlLabel)`
    &&& {
        height: 40px;
        width: 92%;
        border-bottom: solid 1px ${({ theme: { colors } }) => colors.gray11};
        margin: 0px;
        .MuiFormControlLabel-label {
            color: ${({ theme: { colors } }) => colors.primary};
            font-size: 18px;
            letter-spacing: 0.1px;
            font-weight: 300;
        }
    }
`;

export const CustomRadio = styled(Radio)`
    &&& {
        width: 21px;
        height: 21px;
        color: rgba(0, 0, 0, 0.54);
        margin-right: 10px;
    }
`;

export const ButtonContainer = styled.div`
    padding-top: 32px;
    display: flex;
    justify-content: flex-end;
`;

export const CheckedCircle = styled(CheckCircle)`
    &&& {
        fill: ${({ theme: { colors } }) => colors.accent};
        width: 21px;
        height: 21px;
    }
`;

export const NonCheckedCircle = styled(Circle)`
    &&& {
        fill: ${({ theme: { colors } }) => colors.gray12};
        width: 21px;
        height: 21px;
    }
`;

export const ContinueButton = styled(Button)`
    padding: 16px 47px;
`;
