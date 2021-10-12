import styled, { keyframes } from 'styled-components';
import WarningIcon from '@mui/icons-material/ReportProblemRounded';

/**
 * Style of the img tag.
 */
export const ImageStyled = styled.img`
    width: 100%;
    max-width: 100%;
    height: ${({ hidden }) => (hidden ? '0px' : 'auto')};
    line-height: 0;
`;

/**
 * Style of the container wrapping the image, loader and error box.
 */
export const ImageContainer = styled.div`
    position: relative;
    width: 100%;
    max-width: 100%;
`;

/**
 * The loader animation.
 */
const loaderAnimation = keyframes`
    0% {
        background-position: -800px 0
    }
    100% {
        background-position: 800px 0
    }
`;

/**
 * The loader.
 */
export const ImageLoader = styled.div<{ visible: boolean }>`
    width: 100%;
    height: 100%;
    min-height: 200px;
    display: ${({ visible }) => (visible ? 'block' : 'none')};

    animation-duration: 2s;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-name: ${loaderAnimation};
    animation-timing-function: linear;
    background-color: ${({ theme: { colors } }) => colors.gray19};
    background: linear-gradient(to right, ${({ theme: { colors } }) => colors.gray19} 12%, #e8edf2 52%, ${({ theme: { colors } }) => colors.gray19} 83%);
    background-size: 800px 25px;
    height: 70px;
    position: relative;
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
    min-height: 200px;
    padding: 32px 16px;
    background: ${({ theme: { colors } }) => colors.gray19};
    border: 1px solid ${({ theme: { colors } }) => colors.gray20};
    box-shadow: 0px 1px 2px rgba(225, 225, 225, 0.44);
    border-radius: 8px;
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
