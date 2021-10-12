import styled from 'styled-components';
import IconButton from '@mui/material/IconButton';

export const ErrorsBar = styled.div`
    width: 100%;
    padding: 20px 16px;
    background: ${({ theme: { colors } }) => colors.error};
    color: ${({ theme: { colors } }) => colors.white};
    min-height: 22px;
    position: relative;
`;

export const ErrorMessage = styled.p`
    margin: 0;
    opacity: 0.8;
`;

export const ErrorsList = styled.ul`
    width: 100%;
    margin: 0;
    margin-bottom: 5px;
    padding-left: 24px;
    opacity: 0.8;
`;

export const CloseButton = styled(IconButton)`
    &&& {
        color: ${({ theme: { colors } }) => colors.white};
        position: absolute;
        top: 2px;
        right: 2px;
        cursor: pointer !important;
        font-size: 14px;

        span,
        svg,
        path {
            cursor: pointer !important;
        }

        :hover {
            opacity: 0.7;
        }
    }
`;
