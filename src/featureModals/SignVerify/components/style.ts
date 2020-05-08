import styled from 'styled-components';
import Warning from '@material-ui/icons/Warning';

import Button from '../../../components/Button';
import TezosIcon from '../../../components/TezosIcon';
import { ms } from '../../../styles/helpers';

export const Container = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    padding-bottom: 50px 50px 0px;
`;

export const MainContainer = styled.div`
    width: 100%;
    padding: 40px 40px 30px 40px;
`;

export const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60px;
    margin-top: auto;
    padding: 0 40px;
`;

export const ResultContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60px;
    width: 100%;
    padding: 0 40px;
`;

export const MessageContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: flex-start;
    height: 60px;
    width: 100%;
    padding: 40px 40px 0px 40px;
    color: #4e71ab;
    font-weight: 300;
`;

export const InfoIcon = styled(TezosIcon)`
    font-size: ${ms(2)};
    padding: 1px 7px 0px 0px;
`;

export const InfoContainer = styled.div`
    display: flex;
    justify-content: left;
    align-items: center;
    height: 60px;
    width: 100%;
`;

export const Result = styled.div`
    word-wrap: break-word;
`;

export const WarningIcon = styled(Warning)`
    &&& {
        fill: ${({ theme: { colors } }) => colors.error1};
        margin-right: 5px;
    }
`;

export const InvokeButton = styled(Button)`
    width: 194px;
    height: 50px;
    margin-left: auto;
    padding: 0;
`;

export const Footer = styled.div`
    background: ${({ theme: { colors } }) => colors.gray1}
    margin: auto 0 0;
    padding: 25px 0;
    display: flex;
    flex-direction: column
`;
