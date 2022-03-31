import React from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import TezosAddress from '../TezosAddress';

import { StyledTableContainer, StyledTableHeadCell, StyledTableCell, StyledTableCellRight, StyledTableHeadCellRight, TokenTitle } from './style';
import { useSelector } from 'react-redux';

const TableComponent = (props) => {
    const { headerOne, headerTwo, headerThree, tableData, icon, deleteToken } = props;

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
                        tableData.map((data, index) => (
                            <TableRow key={`token-item-${index}`}>
                                <StyledTableCell>
                                    <TokenTitle> {data.displayName} </TokenTitle>
                                    <TezosAddress address={data.address} text={data.address} weight={300} color="gray18" size="14px" shorten={true} />
                                </StyledTableCell>
                                <StyledTableCellRight/>
                                <StyledTableCellRight onClick={() => deleteToken(data)}>
                                    {icon && 'icon'} {/* TODO: Add delete Icon */}
                                </StyledTableCellRight>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </StyledTableContainer>
    );
};

export default TableComponent;
