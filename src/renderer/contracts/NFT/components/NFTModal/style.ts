import styled from 'styled-components';
import IconButton from '@mui/material/IconButton';
import { ModalBox } from '../../../components/style';
import { TabMenu } from '../../../../components/TabMenu';

export const StyledModalBox = styled(ModalBox)`
    position: relative;

    [role='tabpanel'] {
        overflow: auto;
        min-height: 560px;
        max-height: calc(100vh - 80px);
        &::-webkit-scrollbar {
            width: 6px;
        }
        &::-webkit-scrollbar-track {
            background: ${({ theme: { colors } }) => colors.gray2};
        }

        &::-webkit-scrollbar-thumb {
            background: ${({ theme: { colors } }) => colors.accent};
            border-radius: 4px;
        }
    }
`;

export const StyledTabMenu = styled(TabMenu)`
    &&& {
        grid-template-columns: repeat(4, 1fr);

        @media all and (max-width: 767px) {
            grid-template-columns: repeat(3, 1fr);
        }
    }
`;

export const CloseButton = styled(IconButton)`
    &&& {
        color: ${({ theme: { colors } }) => colors.white};
        position: absolute;
        top: 5px;
        right: 5px;
        z-index: 1301;
        cursor: pointer !important;

        span,
        svg,
        path {
            cursor: pointer !important;
        }

        :hover {
            opacity: 0.7;
        }

        @media all and (min-width: 768px) {
            display: block;
        }
    }
`;
