import styled, { css } from 'styled-components';
import Button from '../../../../components/Button';

export const MainContainer = styled.div`
    padding: 13px 76px 0 76px;
`;

export const DescriptionContainer = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 23px;
`;

export const SendSvg = styled.img`
    width: 47px;
    height: 47px;
    flex: none;
`;

export const SendDes = styled.div`
    margin-left: 16px;
    font-size: 16px;
    font-weight: 300;
    line-height: 22px;
    letter-spacing: 0.9px;
    color: ${({ theme: { colors } }) => colors.black};
`;

export const ItemContainer = styled.div`
    width: 100%;
    height: 57px;
    border-bottom: solid 1px rgba(148, 169, 209, 0.27);
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const BottomContainerCss = css`
    display: flex;
    justify-content: space-between;
    height: 124px;
    padding: 0 76px;
    background-color: ${({ theme: { colors } }) => colors.gray1};
`;

export const BottomContainer = styled.div`
    ${BottomContainerCss};
    margin-top: 27px;
`;

export const BottomContainer2 = styled.div`
    ${BottomContainerCss};
    margin-top: 84px;
`;

export const ConfirmImg = styled.img`
    width: 283px;
    height: 84px;
    display: block;
`;

export const ConfirmDes = styled.div`
    font-size: 14px;
    font-weight: 300;
    width: 198px;
    margin: auto 0;
    color: ${({ theme: { colors } }) => colors.gray3};
`;

export const ConfirmSpan = styled.span`
    font-weight: 300;
    color: ${({ theme: { colors } }) => colors.blue4};
`;

export const ItemTitle = styled.div`
    font-size: 12px;
    color: rgba(0, 0, 0, 0.38);
    line-height: 18px;
    display: flex;
    align-items: flex-end;
`;

export const ItemContent = styled.div`
    font-size: 16px;
    line-height: 24px;
    color: ${({ theme: { colors } }) => colors.primary};
    font-weight: 300;
    display: flex;
    align-items: center;
`;

export const SendDesTitle = styled.div`
    font-weight: 600;
    margin-bottom: 4px;
`;

export const ConfirmButton = styled(Button)`
    width: 194px;
    height: 50px;
    margin-top: 23px;
    font-weight: 300;
    padding: 0;
`;

export const SymbolTxt = styled.span`
    font-size: 16px;
    color: ${({ theme: { colors } }) => colors.primary};
    font-weight: 500;
    margin-left: 4px;
`;
