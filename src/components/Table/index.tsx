import React from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { StyledTableContainer, StyledTableHeadCell, StyledTableCell, StyledTableCellRight, StyledTableHeadCellRight, TokenTitle, TokenAddress } from './style';
import { useSelector } from 'react-redux';

const TableComponent = (props) => {
    const { headerOne, headerTwo, headerThree, tableData, icon } = props;
    return (
        <StyledTableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <StyledTableHeadCell>{headerOne}</StyledTableHeadCell>
                        <StyledTableHeadCellRight> {headerTwo} </StyledTableHeadCellRight>
                        <StyledTableHeadCellRight> {headerThree} </StyledTableHeadCellRight>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tableData &&
                        tableData.map((data) => (
                            <TableRow key={data.id}>
                                <StyledTableCell>
                                    <TokenTitle> User added collection 1 </TokenTitle>
                                    <TokenAddress> KT5Qn6gt...VbJxtoH </TokenAddress>
                                </StyledTableCell>
                                <StyledTableCellRight> 4 OBKT </StyledTableCellRight>
                                <StyledTableCellRight>{icon && 'icon'}</StyledTableCellRight>
                            </TableRow>
                        ))}
                    <TableRow>
                        <StyledTableCell>
                            <TokenTitle> User added collection 1 </TokenTitle>
                            <TokenAddress> KT5Qn6gt...VbJxtoH </TokenAddress>
                        </StyledTableCell>
                        <StyledTableCellRight> 4 OBKT </StyledTableCellRight>
                        <StyledTableCellRight>{icon && 'icon'}</StyledTableCellRight>
                    </TableRow>
                </TableBody>
            </Table>
        </StyledTableContainer>
    );
};

export default TableComponent;
