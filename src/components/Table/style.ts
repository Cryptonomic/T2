import styled from 'styled-components';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

export const StyledTableContainer = styled(TableContainer)`
    margin-bottom: 40px;
`;
export const StyledTable = styled(Table)``;
export const StyledTableHead = styled(TableHead)``;
export const StyledTableBody = styled(TableBody)``;
export const StyledTableRow = styled(TableRow)``;
export const StyledTableHeadCell = styled(TableCell)`
    height: 16px;
    font-size: 16px;
    font-weight: 400;
    color: ${({ theme: { colors } }) => colors.gray3} !important;
    border: 0 !important;
    min-width: 148px;
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

export const TokenAddress = styled.p`
    font-weight: 300;
    font-size: 14px;
    line-height: 16px;
`;
