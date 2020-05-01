import styled from 'styled-components';

import TezosIcon from '../../../../components/TezosIcon';

export const Container = styled.div`
    padding: 0 20px 20px 20px;
`;

export const BroadIcon = styled(TezosIcon)`
    margin-left: 2px;
`;

export const LinkContainer = styled.span`
    display: inline-block;
    margin-left: 7px;
    cursor: pointer;
`;

export const LinkTitle = styled.span`
    font-size: 12px;
    text-decoration: underline;
`;

export const ContentTitle = styled.div`
    font-size: 24px;
    font-weight: 300;
    line-height: 34px;
    color: ${({ theme: { colors } }) => colors.primary};
    letter-spacing: 1px;
    margin-bottom: 32px;
`;
