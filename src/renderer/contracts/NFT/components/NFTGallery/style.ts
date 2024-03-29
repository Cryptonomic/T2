import styled, { css } from 'styled-components';
import { styled as mStyled } from '@mui/system';
import { withStyles } from 'tss-react/mui';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import FormControl from '@mui/material/FormControl';
import AddCircle from '@mui/icons-material/AddCircle';

/**
 * The wrapper positioning the loader on the center
 */
export const LoaderWrapper = styled.div`
    width: 100%;
    padding: 80px 20px;
    position: relative;
`;

/**
 * The number of tokens in the page banner.
 */
export const TokensCount = styled.span`
    margin-right: 4px;
`;
export const AddButton = styled(Button)`
    align-self: center;
    cursor: pointer;
    color: ${({ theme: { colors } }) => colors.accent} !important;
    padding: 0 !important;
    &:hover {
        background: transparent !important;
    }
`;

export const SearchForm = mStyled(FormControl)({
    display: 'flex',
    width: '383px',
    margin: '27px 0 36px 43px',
});

export const SearchInput = mStyled(InputBase)({
    borderRadius: 4,
    position: 'relative',
    backgroundColor: '#F4F4F4',
    fontSize: 14,
    width: '100%',
    padding: '0px 0px 0px 12px',
    maxWidth: '462px',
    height: '32px',
});

export const AddIcon = styled(AddCircle)`
    &&& {
        fill: ${({ theme: { colors } }) => colors.secondary};
        height: 16px;
        width: 16px;
    }
`;
