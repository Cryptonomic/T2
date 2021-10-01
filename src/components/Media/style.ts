import styled from 'styled-components';
import mStyled from '@material-ui/styles/styled';
import IconButton from '@material-ui/core/IconButton';
import Modal from '@material-ui/core/Modal';
import WarningIcon from '@material-ui/icons/ReportProblemRounded';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { Image } from '../Image';

export const CloseModalButton = styled(IconButton)`
    &&& {
        color: white;
        position: fixed;
        top: 20px;
        right: 20px;
        cursor: pointer;
    }
`;

export const MediaContainer = styled.div`
    position: relative;
    line-height: 0;

    & .preview-hover {
        display: none;
    }

    &:hover .preview-hover {
        display: block;
    }
`;

export const ModalBox = styled.div`
    max-width: 90vw;
    max-height: 90vh;

    & img,
    div {
        width: auto;
        height: auto;
        max-width: 90vw;
        max-height: 90vh;
    }
`;

export const ModalContainer = styled(Modal)`
    display: flex;
    justify-content: center;
    align-items: center;

    max-width: 100vw;
    max-height: 100vh;

    .dark-backdrop {
        background: rgba(0, 0, 0, 0.8) !important;
    }
`;

export const PreviewHover = styled.div`
    background: rgba(0, 0, 0, 0.4);
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    cursor: pointer;
    border-radius: 8px;
`;

export const PreviewIcon = styled.span`
    position: absolute;
    bottom: 20px;
    right: 20px;
    padding: 12px;
    background: white;
    border-radius: 50%;
`;

export const StyledImage = styled(Image)`
    & > img {
        border-radius: 8px;
    }
`;

/**
 * Style of the failed/error message box.
 */
export const ImageFailed = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: 280px;
    padding: 32px 16px;
    background: ${({ theme: { colors } }) => colors.gray19};
    border: 1px solid ${({ theme: { colors } }) => colors.gray20};
    box-shadow: 0px 1px 2px rgba(225, 225, 225, 0.44);
    border-radius: 8px;
`;

export const ImageFailedBottom = styled.div`
    display: flex;
    flex-direction: column;
`;

export const FailedIcon = styled(WarningIcon)`
    color: ${({ theme: { colors } }) => colors.gray18};
    font-size: 43px !important;
`;

export const FailedMessage = styled.p`
    color: ${({ theme: { colors } }) => colors.gray18};
    text-align: center;
    font-weight: bold;
`;

export const ImageFailedTop = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

export const ImageFailedLink = styled.a`
    cursor: pointer;
    color: ${({ theme: { colors } }) => colors.gray0} !important;
    text-decoration: underline;

    &:hover {
        color: ${({ theme: { colors } }) => colors.primary} !important;
    }
`;

export const FailedLinkIcon = mStyled(OpenInNewIcon)({
    fontSize: '16px',
    marginLeft: '5px',
    verticalAlign: 'middle',

    '&:hover': {
        cursor: 'pointer',
    },
});
