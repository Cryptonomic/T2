import React from 'react';
import { useTranslation } from 'react-i18next';

import CloseIcon from '@mui/icons-material/Close';

import { CloseButton, ModalHeader, StyledModalBox } from './style';
import { ModalWrapper } from '../../contracts/components/style';

import TableComponent from '../Table';

import { useSelector } from 'react-redux';
import { getLocalData } from '../../utils/localData';

export const ManageNFTsModal = ({ open, onClose, tokens }) => {
    const { t } = useTranslation();
    const localTokens = getLocalData('token');

    const sortedTokens = tokens.sort((a, b) => b.balance - a.balance || a.displayName.localeCompare(b.displayName));
    const customSortedTokens = [localTokens].sort((a, b) => b.balance - a.balance || a.displayName.localeCompare(b.displayName));

    const deleteToken = (item) => {
        console.log('deleted', item);
    };

    return (
        <ModalWrapper open={open} onClose={onClose} aria-labelledby="Tokens" aria-describedby="Manage token collections">
            <StyledModalBox>
                <ModalHeader>{t('components.manageNFTsModal.modal_title')}</ModalHeader>
                <TableComponent
                    tableData={customSortedTokens}
                    headerOne="Custom Added NFTs"
                    headerTwo="Quantity"
                    headerThree="Remove"
                    icon={true}
                    deleteToken={(token) => deleteToken(token)}
                />
                <TableComponent tableData={sortedTokens} headerOne="Other NFTs" headerTwo="Quantity" headerThree="" />
                <CloseButton onClick={onClose}>
                    <CloseIcon />
                </CloseButton>
            </StyledModalBox>
        </ModalWrapper>
    );
};
