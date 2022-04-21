import React from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';

import TezosAddress from '../TezosAddress';

import trashCan from '../../../resources/trash-can.svg';

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
                    {tableData !== undefined &&
                        tableData.map((data, index) => (
                            <TableRow key={`token-item-${index}`}>
                                <StyledTableCell>
                                    <TokenTitle> {data.displayName} </TokenTitle>
                                    <TezosAddress address={data.address} text={data.address} weight={300} color="gray18" size="14px" shorten={true} />
                                </StyledTableCell>
                                <StyledTableCellRight />
                                <StyledTableCellRight>
                                    {icon && (
                                        <Button disableRipple={true} onClick={() => deleteToken(data)}>
                                            <img src={trashCan} alt="trash-can" />
                                        </Button>
                                    )}
                                </StyledTableCellRight>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </StyledTableContainer>
    );
};

export default TableComponent;
