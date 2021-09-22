import styled from 'styled-components';
import mStyled from '@material-ui/styles/styled';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { Image } from '../../Image';
import { ImageFailed } from '../../Image/style';
import TezosIcon from '../../TezosIcon';

export const ThumbContainer = styled.article`
    margin-bottom: 12px;
    padding-top: 24px;
`;

export const ImageStyled = styled(Image)`
    & > .loader {
        min-height: 200px;
    }
`;

export const ImageFailedStyled = styled(ImageFailed)`
    min-height: 280px;
`;

export const ImageFailedLink = styled.a`
    cursor: pointer;
    color: ${({ theme: { colors } }) => colors.gray0} !important;
    text-decoration: underline;

    &:hover {
        color: ${({ theme: { colors } }) => colors.primary} !important;
    }
`;

export const ImageFailedTop = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

export const ImageFailedBottom = styled.div`
    display: flex;
    flex-direction: column;
`;

export const LinkIcon = mStyled(OpenInNewIcon)({
    fontSize: '16px',
    marginLeft: '5px',
    verticalAlign: 'middle',

    '&:hover': {
        cursor: 'pointer',
    },
});

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
