import styled from 'styled-components';

import { ms } from '../../../styles/helpers';
import TezosIcon from '../../../components/TezosIcon';

export const AmountContainer = styled.div<{ color: string }>`
    color: ${({ theme: { colors }, color }) => colors[color]};
    font-size: ${ms(-1)};
`;

export const TransactionContainer = styled.div`
    padding: 8px 25px 17px 25px;
    border-bottom: solid 1px ${({ theme: { colors } }) => colors.gray7};
    &:last-child {
        border: none;
    }
`;

export const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

export const ContentDiv = styled.div`
    display: flex;
    align-items: baseline;
    line-height: 14px;
    flex: 1;
`;

export const StateIcon = styled(TezosIcon)`
    margin-right: 5px;
`;

export const LinkIcon = styled(TezosIcon)`
    margin-left: 6px;
    cursor: pointer;
`;

export const StateText = styled.div`
    font-size: 10px;
    color: ${({ theme: { colors } }) => colors.accent};
    span {
        font-size: 12px;
        color: ${({ theme: { colors } }) => colors.gray6};
        margin: 0 6px;
    }
`;

export const TransactionDate = styled.div`
    color: ${({ theme: { colors } }) => colors.gray5};
`;

export const Fee = styled.div`
    font-size: ${ms(-2)};
    color: ${({ theme: { colors } }) => colors.gray5};
`;

export const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: ${({ theme: { colors } }) => colors.gray5};
    font-size: 12px;
    line-height: 30px;
`;
