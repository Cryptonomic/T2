import styled from 'styled-components';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Button from '../../../../components/Button';
import Media from '../../../../components/Media';

export const SendForm = styled.form`
    display: flex;
    width: 100%;
    flex-direction: column;
`;

export const Row = styled.div`
    display: flex;
    margin-bottom: 40px;
    @media all and (max-width: 767px) {
        flex-direction: column;
    }
`;

export const BottomRow = styled(Row)`
    margin-bottom: 0px !important;
`;

const Col = styled.div`
    display: flex;
    flex-direction: column;
`;

export const LeftCol = styled(Col)`
    flex: 1;
    padding-right: 40px;
`;

export const RightCol = styled(Col)`
    width: 300px;
    justify-content: flex-start;
`;

export const SubmitButton = styled(Button)`
    width: 200px;
    min-width: 120px;
    max-width: 100%;
    padding: 14px;
    margin-top: 15px;
`;

export const CustomDivider = styled(Divider)`
    margin-bottom: 30px !important;
`;

export const FeeContainer = styled.div`
    width: 100%;
    max-width: 300px;
    display: flex;
    height: 64px;
`;

export const TooltipContainer = styled.div`
    padding: 10px;
    color: #000;
    font-size: 14px;
    max-width: 312px;
`;

export const TooltipTitle = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: ${({ theme: { colors } }) => colors.primary};
`;

export const TooltipContent = styled.div`
    margin-top: 8px;
    font-size: 14px;
    line-height: 21px;
    width: 270px;
    font-weight: 300;
    color: ${({ theme: { colors } }) => colors.black};
`;

export const BoldSpan = styled.span`
    font-weight: 500;
`;

export const FeeTooltipBtn = styled(IconButton)`
    &&& {
        position: relative;
        top: 1px;
    }
`;

export const BalanceSummaryContainer = styled.div`
    display: flex;
    align-items: center;
    margin-top: 10px;
`;

export const BalanceTitle = styled.div`
    color: ${({ theme: { colors } }) => colors.gray5};
    font-size: 14px;
    font-weight: 300;
`;

export const BalanceContent = styled.div`
    margin-left: 40px;
`;

export const PasswordContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    height: 100px;
    margin-top: auto;
    width: 100%;
`;

export const MediaStyled = styled(Media)`
    &&& {
        width: 100%;
        max-height: 400px;
        margin-bottom: 8px;

        @media all and (max-width: 767px) {
            margin-top: 40px;
        }
    }
`;
