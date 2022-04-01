import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import CloseIcon from '@mui/icons-material/Close';

import { CloseButton, ModalHeader, StyledModalBox, StyledDivider, FooterCon, FooterText } from './style';
import { ModalWrapper } from '../../contracts/components/style';

import TableComponent from '../Table';
import { AddButton, AddIcon } from '../../contracts/NFT/components/NFTGallery/style';

import { getLocalData } from '../../utils/localData';
import { setModalOpen } from '../../reduxContent/modal/actions';

export const ManageNFTsModal = ({ open, onClose, tokens }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

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
                <StyledDivider />
                <FooterCon>
                    <FooterText>Don’t see your NFTs?</FooterText>
                    <AddButton
                        startIcon={<AddIcon />}
                        onClick={() => {
                            onClose();
                            dispatch(setModalOpen(true, 'NFTAdd'));
                        }}
                        disableRipple={true}
                    >
                        Add NFT
                    </AddButton>
                </FooterCon>
            </StyledModalBox>
        </ModalWrapper>
    );
};
