import styled, { css } from 'styled-components';
import ArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import ArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { Button, FormControlLabel, Checkbox, FormGroup } from '@mui/material';

export const Container = styled.div`
    text-align: center;
    height: 515px;
    background: #ffffff;
    padding: 29px 0 195px 0;
`;
export const Container1 = styled.div`
    width: 543px;
    margin: 0 auto;
`;
export const MainContainer = styled.div<{ isFirst: boolean }>`
    display: flex;
    justify-content: space-between;
    margin-top: ${({ isFirst }) => (isFirst ? '0px' : '81px')};
`;

export const WelcomeTxt = styled.p`
    color: ${({ theme: { colors } }) => colors.primary};
    font-weight: 600;
    font-size: 30px;
    line-height: 30px;
    letter-spacing: 2px;
    margin: 0;
    text-align: center;
`;

export const CarouselIndicator = styled.li<{ isActive: boolean }>`
    border-radius: 50%;
    display: inline-block;
    margin: 0 4px;
    ${({ isActive }) => {
        if (isActive) {
            return css`
                width: 13px;
                height: 13px;
                background-color: ${({ theme: { colors } }) => colors.primary};
            `;
        }
        return css`
            width: 9px;
            height: 9px;
            background-color: #828282;
        `;
    }};
`;

export const ButtonContainer = styled(Button)<{ isleft: number }>`
    &&& {
        padding: 0;
        position: absolute;
        bottom: 82px;
        z-index: 100;
        ${({ isleft }) => {
            if (isleft) {
                return css`
                    left: 171px;
                `;
            }
            return css`
                right: 171px;
            `;
        }};
        &.MuiButton-textSecondary:hover {
            background-color: transparent;
        }
        &.Mui-disabled {
            opacity: 0.4;
            color: ${({ theme: { colors } }) => colors.accent};
        }
    }
`;

export const BackCaret = styled(ArrowLeft)`
    &&& {
        height: 28px;
        width: 28px;
    }
`;

export const NextCaret = styled(ArrowRight)`
    &&& {
        height: 28px;
        width: 28px;
    }
`;

export const LangTitle = styled.div`
    color: ${({ theme: { colors } }) => colors.primary};
    font-weight: 400;
    font-size: 23px;
    line-height: 27px;
    letter-spacing: 0.1px;
    margin: 25px 0 29px 0;
`;

export const LanguageContainer = styled.div`
    padding-top: 27px;
    width: 100%;
    margin-left: 15px;
`;

export const TermsLogo = styled.img`
    width: 204px !important;
    height: 175px;
`;

export const TosContainer = styled.div`
    padding-top: 20px;
    margin-left: 34px;
`;

export const FormGroupWrapper = styled(FormGroup)`
    margin-top: 20px;
`;

export const FormControlLabelWrapper = styled(FormControlLabel)`
    &&& {
        .MuiTypography-body1 {
            color: ${({ theme: { colors } }) => colors.gray17};
            font-weight: 300;
            font-size: 16px;
        }
    }
`;

export const CheckBoxWrapper = styled(Checkbox)`
    &&& {
        &.MuiCheckbox-root {
            color: ${({ theme: { colors } }) => colors.gray17};
        }
        &.Mui-checked {
            color: ${({ theme: { colors } }) => colors.gray17};
        }
        .MuiSvgIcon-root {
            width: 0.8em;
            height: 0.8em;
        }
    }
`;

export const TosDesTxt = styled.div`
    color: ${({ theme: { colors } }) => colors.primary};
    font-weight: 300;
    font-size: 18px;
    line-height: 26px;
    letter-spacing: 0.1px;
    text-align: left;
`;

export const Link = styled.span`
    color: ${({ theme: { colors } }) => colors.accent};
    cursor: pointer;
    font-weight: ${({
        theme: {
            typo: { weights },
        },
    }) => weights.normal};
`;

export const ThirdTxt = styled.p`
    color: ${({ theme: { colors } }) => colors.primary};
    font-size: 17px;
    margin: 20px 0 0 34px;
    text-align: left;
`;

export const StartBtn = styled(Button)`
    &&& {
        padding: 0;
        position: absolute;
        bottom: 82px;
        z-index: 100;
        right: 171px;
        width: 140px;
        border-radius: 25px;
    }
`;
