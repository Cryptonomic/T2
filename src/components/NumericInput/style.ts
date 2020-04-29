import styled from 'styled-components';

import TezosIcon from '../TezosIcon';

export const TezosIconInput = styled(TezosIcon)`
    position: absolute;
    right: 0px;
    top: 26px;
    display: block;
`;

export const SymbolTxt = styled.span`
    position: absolute;
    right: 0px;
    top: 24px;
    font-size: 14px;
    color: ${({ theme: { colors } }) => colors.primary};
    font-weight: 500;
`;

export const NumericInputContainer = styled.div`
    position: relative;
`;
