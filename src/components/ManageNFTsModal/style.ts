import styled from 'styled-components';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { ModalBox } from '../../contracts/components/style';

export const styledTable = styled(Table)`
  background: 'red;
`;

export const StyledModalBox = styled(ModalBox)`
    position: relative;
    overflow: auto;
    width: 570px;
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
`;

export const ModalHeader = styled.h2`
    background: ${({ theme: { colors } }) => colors.accent};
    font-size: 16px;
    font-weight: 400;
    color: ${({ theme: { colors } }) => colors.white};
    margin: 0;
    padding: 15px 0 13px 16px;
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
