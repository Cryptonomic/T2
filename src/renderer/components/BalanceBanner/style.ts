import styled from 'styled-components';
import { lighten } from 'polished';
import Notifications from '@mui/icons-material/Notifications';
import IconButton from '@mui/material/IconButton';
import { H4 } from '../Heading';
import TezosIcon from '../TezosIcon';
import Button from '../Button';
import { ms } from '../../styles/helpers';

export const Container = styled.header`
    padding: ${ms(0)} ${ms(4)};
    background-color: ${({ theme: { colors } }) => colors.accent};
`;

export const Row = styled.div`
    margin: 0 0 ${ms(3)} 0;
`;

export const TopRow = styled(Row)<{ isReady: boolean }>`
    display: flex;
    justify-content: space-between;
    color: ${({ theme: { colors } }) => lighten(0.3, colors.accent)};
    opacity: ${({ isReady }) => (isReady ? '1' : '0.5')};
`;

export const BottomRow = styled(Row)<{ isReady: boolean }>`
    color: ${({ theme: { colors } }) => colors.white};
    opacity: ${({ isReady }) => (isReady ? '1' : '0.5')};
`;

export const AddressTitle = styled(H4)`
    font-weight: 500;
    color: ${({ theme: { colors } }) => colors.white};
    margin: 0;
    line-height: 1.75;
    font-size: ${ms(2.2)};
`;

export const AddressTitleIcon = styled(TezosIcon)`
    padding: 0 ${ms(-6)} 0 0;
`;

export const AddressInfo = styled.div`
    display: flex;
    align-items: center;
    line-height: 1.9;
    flex-wrap: wrap;
`;

export const Gap = styled.div`
    width: 10px;
`;

export const DelegateName = styled.span`
    font-weight: 500;
    margin-left: 3px;
    margin-right: 3px;
`;

export const DelegateContainer = styled.div`
    display: flex;
    font-weight: 100;
`;

export const Breadcrumbs = styled.div`
    font-size: ${ms(-1)};
`;

export const CircleKeyIcon = styled.img`
    width: 27px;
`;

export const KeyIconButton = styled(IconButton)`
    position: relative;
    top: 1px;
    left: 4px;
`;

export const KeyIcon = styled.img`
    width: 17px;
    height: 18px;
    cursor: pointer;
    padding: 2px;
`;

export const ModalContent = styled.div`
    padding: 35px 76px 25px 76px;
`;

export const ButtonContainer = styled.div`
    width: 100%;
    margin-top: 75px;
    text-align: center;
`;

export const CloseButton = styled(Button)`
    width: 194px;
    height: 50px;
`;

export const HideShowContainer = styled.div`
    color: ${({ theme: { colors } }) => colors.gray5};
    font-size: 16px;
    font-weight: 400;
    line-height: 19px;
    cursor: pointer;
    width: 100%;
`;

export const KeyContainer = styled.div`
    color: ${({ theme: { colors } }) => colors.primary};
    font-size: 16px;
    font-weight: 400;
    line-height: 19px;
    padding: 20px 19px 14px 19px;
    margin-top: 10px;
    width: 100%;
    word-wrap: break-word;
    -webkit-user-select: text;
    user-select: text;
`;

export const WarningContainer = styled.div`
    border-radius: 3px;
    border: 1px solid ${({ theme: { colors } }) => colors.index1};
    width: 475px;
    height: 91px;
    padding: 0 39px 0 29px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 50px;
    font-size: 16px;
    line-height: 19px;
    color: rgb(18, 50, 98);
`;

export const WarningTxt = styled.span`
    font-weight: 500;
`;

export const StoreTxt = styled.div`
    font-weight: 400;
    margin-left: 23px;
`;

export const BellIcon = styled(Notifications)`
    &&& {
        font-size: 18px;
        position: relative;
        top: 1px;
        cursor: pointer;
        color: white;
    }
`;

export const TooltipContent = styled.div`
    color: ${({ theme: { colors } }) => colors.primary};
    font-weight: 300;
    font-size: ${ms(-1)};
    max-width: ${ms(13)};
`;

export const LinkContainer = styled.div`
    cursor: pointer;
    display: inline-block;
`;

export const LinkIcon = styled(TezosIcon)`
    position: relative;
    top: 1px;
    margin-left: 2px;
`;

export const Column = styled.div`
    display: flex;
    flex-direction: column;
`;

export const Currencies = styled(Column)`
    margin-left: 15px;
`;

export const CurrencySymbol = styled.span`
    margin-left: 5px;
`;

export const WertButton = styled.span`
    font-family: Roboto;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    padding-left: 5px;
    letter-spacing: 0em;
    text-decoration-line: none;
    color: ${({ theme: { colors } }) => colors.white};
    background-color: ${({ theme: { colors } }) => colors.accent};
`;
