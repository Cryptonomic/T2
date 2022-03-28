import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import SearchIcon from '@mui/icons-material/Search';

import { AddIcon, SearchForm, SearchInput, AddButton } from './style';
import { RowContainer } from '../../../components/style';
import { setModalOpen } from '../../../../reduxContent/modal/actions';

export const NFTAdd = () => {
    const dispatch = useDispatch();

    const [search, setSearch] = useState('');

    return (
        <RowContainer>
            <SearchForm>
                <SearchInput
                    defaultValue=""
                    id="NFT-search-input"
                    placeholder="Search NFT by name, collection or token ID"
                    startAdornment={<SearchIcon style={{ fill: search ? '#000000' : '#BDBDBD' }} />}
                    // onChange={onSearchTokens}
                    // value={search}
                />
            </SearchForm>
            <AddButton startIcon={<AddIcon />} onClick={() => dispatch(setModalOpen(true, 'NFTAdd'))} disableRipple={true}>
                Add NFT
            </AddButton>
        </RowContainer>
    );
};
