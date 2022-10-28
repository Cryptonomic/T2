import styled, { css } from 'styled-components';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';

export const SectionContainer = styled.div`
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    overflow-y: hidden;
    overflow-x: hidden;
    margin-top: -90px;
`;

export const TermsAndPolicySection = styled.div`
    display: flex;
    width: 80%;
    justify-content: center;
    align-items: center;
    font-weight: 300;
    margin-top: 0 auto 0 10px;
`;

export const Strong = styled.span`
    color: ${({ theme: { colors } }) => colors.accent};
    font-weight: 400;
`;

export const Link = styled(Strong)`
    cursor: pointer;
`;

export const Description = styled.span`
    margin-left: 10px;
`;

export const Tip = styled.div`
    width: 76%;
    justify-content: center;
    margin-top: 2%;
    font-size: 14px;
    line-height: 1.5;
    font-weight: 300;
    letter-spacing: 0.6px;
    text-align: left;
    color: ${({ theme: { colors } }) => colors.primary};
`;

export const AppName = styled.h1`
    text-align: center;
    width: 100%;
    margin: 0;
    font-family: 'Roboto', san-serif;
    font-style: normal;
    font-stretch: normal;
    font-size: 45px;
    font-weight: 300;
    line-height: 50px;
    letter-spacing: 5px;
    color: ${({ theme: { colors } }) => colors.primary};
`;

const BaseButtonCss = css`
    width: 74%;
    height: 9.5%;
`;

export const UnlockWalletButton = styled(Fab)`
    &&& {
        ${BaseButtonCss};
        margin-top: 8%;
    }
`;

export const CreateWalletButton = styled(Button)`
    &&& {
        ${BaseButtonCss};
        border-radius: 20px;
        margin-top: 5%;
    }
`;

export const DefaultContainer = styled.div`
    justify-content: center;
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 0px 0px;
`;

export const NameSection = styled.section`
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
    height: 140px;
`;

export const Section = styled.section`
    display: flex;
    flex-direction: row;
    flex: 1;
    width: 100%;
    justify-content: center;
`;

export const Background = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    color: #edf0f7;
`;

export const CardContainer = styled.div`
    width: 380px;
    height: 530px;
    border-radius: 5px;
    background-color: ${({ theme: { colors } }) => colors.white};
    box-shadow: 0 2px 4px 0 ${({ theme: { colors } }) => colors.gray13};
    margin: 0 3.5%;
    text-align: center;
    padding: 20px 0 14px 0;
    display: flex;
    align-items: center;
    flex-direction: column;
    margin-top: 15px;
`;

export const CardImg = styled.img`
    width: 55%;
    height: 41%;
`;

export const CardTitle = styled.div`
    font-size: 24px;
    font-weight: 300;
    line-height: 20px;
    margin-top: 5%;
    color: ${({ theme: { colors } }) => colors.primary};
    letter-spacing: 1.7px;
`;

export const Linebar = styled.div`
    width: 87%;
    height: 1px;
    background-color: ${({ theme: { colors } }) => colors.gray9};
    opacity: 0.46;
    margin-top: auto;
`;

export const LedgerConnect = styled.div`
    font-size: 16px;
    line-height: 21px;
    letter-spacing: 0.7px;
    font-weight: 300;
    width: 288px;
    text-align: left;
    margin-top: 20px;
`;
export const DescriptionBold = styled.span`
    font-weight: 400;
`;

export const SelectedPath = styled.div`
    margin-top: 2%;
    font-size: 14px;
    font-weight: 300;
    letter-spacing: 0.6px;
    text-align: center;
    color: ${({ theme: { colors } }) => colors.primary};
`;
