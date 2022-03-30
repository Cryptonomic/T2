import React from 'react';
import { useTranslation } from 'react-i18next';

import CloseIcon from '@mui/icons-material/Close';

import { CloseButton, ModalHeader, StyledModalBox } from './style';
import { ModalWrapper } from '../../contracts/components/style';

import TableComponent from '../Table';

import { StyledTable, StyledTableHead, StyledTableHeadCell, StyledTableRow, StyledTableCell, StyledTableBody } from '../Table/style';
import { useSelector } from 'react-redux';

export const ManageNFTsModal = ({ open, onClose }) => {
    const { t } = useTranslation();

    return (
        <ModalWrapper open={open} onClose={onClose} aria-labelledby="Tokens" aria-describedby="Manage token collections">
            <StyledModalBox>
                <ModalHeader>{t('components.manageNFTsModal.modal_title')}</ModalHeader>
                <TableComponent headerOne="Custom Added NFTs" headerTwo="Quantity" headerThree="Remove" icon={true} />
                <TableComponent headerOne="Other NFTs" headerTwo="Quantity" headerThree="" />
                <CloseButton onClick={onClose}>
                    <CloseIcon />
                </CloseButton>
            </StyledModalBox>
        </ModalWrapper>
    );
};
