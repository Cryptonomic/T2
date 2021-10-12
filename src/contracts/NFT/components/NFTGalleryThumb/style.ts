import styled from 'styled-components';
import { styled as mStyled } from '@mui/styles';
import Media from '../../../../components/NFTMedia';
import TezosIcon from '../../../../components/TezosIcon';

export const ThumbContainer = styled.article`
    margin-bottom: 12px;
    padding-top: 24px;
`;

export const MediaStyled = styled(Media)`
    & > .loader {
        min-height: 200px;
    }
`;

export const TopRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
`;

export const BottomRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

export const Title = styled.h3`
    font-weight: normal;
    margin: 0;
    font-size: 16px;
    cursor: pointer;

    &:hover {
        color: ${({ theme: { colors } }) => colors.accent};
    }
`;

export const Address = styled.span`
    color: ${({ theme: { colors } }) => colors.gray18};
`;

export const Capitalize = styled.span`
    text-transform: capitalize;
`;

export const TezosIconStyled = styled(TezosIcon)`
    line-height: 1;
    vertical-align: middle;
`;
