import styled from 'styled-components';

import { ms } from '../../../../styles/helpers';
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

export const Image = styled.img`(
    display: inline-block;
)`;

export const InfoLink = styled.div`
    cursor: pointer;
`;

export const LinkIcon = styled(TezosIcon)`
    margin-left: 6px;
    cursor: pointer;
    size: ${ms(0)};
`;

export const PieceContainer = styled.div`
    display: flex;
    width: 100%;
    padding-bottom: 20px;
    border-bottom: 1px solid #e0e0e0;
`;

export const PieceInfo = styled.div`
    flex: 1;
    padding: 5px;
`;

export const PieceName = styled.div`
    font-weight: 600;
`;

export const PieceId = styled.span`
    font-weight: 400;
    margin-left: 6px;
`;

export const PieceDescription = styled.div``;

export const PieceCreator = styled.div``;

export const PieceDisplay = styled.div`
    flex: 1;
    padding: 3px;
`;
