import styled from 'styled-components';

import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';

export const StyledTableContainer = styled(TableContainer)`
    margin-bottom: 40px;
    padding-top: 27px;
`;
export const StyledTableHeadCell = styled(TableCell)`
    height: 16px;
    font-size: 16px;
    font-weight: 400;
    color: ${({ theme: { colors } }) => colors.gray3} !important;
    border: 0 !important;
    min-width: 230px;
    padding: 0 16px !important;
`;
export const StyledTableHeadCellRight = styled(TableCell)`
    height: 16px;
    font-size: 16px;
    font-weight: 400;
    color: ${({ theme: { colors } }) => colors.gray3} !important;
    border: 0 !important;
    min-width: 148px;
    padding: 0 16px !important;
    text-align: right !important;
`;
export const StyledTableCell = styled(TableCell)`
    border: 0 !important;
`;
export const StyledTableCellRight = styled(TableCell)`
    border: 0 !important;
    text-align: right !important;
`;

export const TokenTitle = styled.p`
    font-weight: 400;
    font-size: 16px;
    line-height: 16px;
`;
