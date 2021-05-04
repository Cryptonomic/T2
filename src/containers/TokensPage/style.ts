import styled from 'styled-components';
import mStyled from '@material-ui/styles/styled';
import { withStyles } from '@material-ui/styles';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import InputBase from '@material-ui/core/InputBase';
import FormControl from '@material-ui/core/FormControl';

export const BottomRowInner = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

export const Link = styled.div`
    display: flex;
    align-items: center;
    font-size: 14px;
    line-height: 16px;
    cursor: pointer;
`;

export const LinkIcon = mStyled(OpenInNewIcon)({
    fontSize: '12px',
    marginLeft: '5px',
    '&:hover': {
        cursor: 'pointer',
    },
});

export const Box = withStyles({
    root: {
        maxWidth: '208px',
        minWidth: '208px',
        minHeight: '193px',
        position: 'relative',
        margin: '10px',
    },
})(Grid);

export const BoxBg = styled.div`
    background-color: #f6f8fa;
    border: 1px solid #d8e4fc;
    border-radius: 8px;
    display: flex;
    height: 100%;
    flex-direction: column;
    padding: 16px 13px 29px 16px;
    box-shadow: 0px 1px 2px rgba(225, 225, 225, 0.44);
    position: relative;
    top: 0;
    left: 0;
    z-index: 2;
    cursor: pointer;
`;

export const BoxHover = styled.div`
    width: calc(100% + 5px);
    height: calc(100% + 5px);
    position: absolute;
    top: 0;
    left: 0;
    background: #e7efff;
    filter: blur(12px);
    z-index: 1;
`;

export const BoxIcon = styled.div`
    width: 100%;
    display: flex;
    align-self: center;
    width: 40px;
    height: 40px;
`;

export const Img = styled.img`
    width: 100%;
    height: 100%;
    object-fit: contain;
`;

export const BoxTitle = styled.div`
    font-size: 24px;
    line-height: 28px;
    width: 100%;
    text-align: center;
    margin-top: 8px;
`;

export const BoxDescription = styled.div`
    font-weight: 300;
    font-size: 14px;
    line-height: 16px;
    margin-top: 8px;
`;

export const BlueLink = styled.span<{ isActive: boolean | undefined }>`
    color: ${({ isActive }) => (isActive ? '#2F80ED' : '')};
    cursor: ${({ isActive }) => (isActive ? 'pointer' : '')};
    position: relative;
    z-index: 100;
`;

export const TokensTitle = styled.div`
    font-size: 24px;
    line-height: 28px;
    letter-spacing: 0.015em;
    color: #4f4f4f;
    margin: 24px 0px 0px 10px;
`;

export const HorizontalDivider = mStyled(Divider)({
    marginTop: '24px',
    backgroundColor: '#E0E0E0',
});

export const BalanceTitle = styled.div`
    font-size: 16px;
    line-height: 16px;
    margin-top: 16px;
`;

export const BalanceAmount = styled.div`
    font-size: 24px;
    line-height: 28px;
    margin-top: 4px;
`;

export const ListsWrapper = styled.div`
    padding: 0px 24px;
`;

export const SearchForm = mStyled(FormControl)({
    marginTop: '16px',
    display: 'flex',
});

export const SearchInput = withStyles((theme) => ({
    root: {
        'label + &': {
            marginTop: theme.spacing(3),
        },
        backgroundColor: '#F4F4F4',
        borderRadius: '4px',
        height: '32px',
        maxWidth: '462px',
        padding: '0px 12px',
    },
    input: {
        borderRadius: 4,
        position: 'relative',
        backgroundColor: '#F4F4F4',
        fontSize: 16,
        width: 'auto',
        padding: '0px 0px 0px 12px',
        transition: theme.transitions.create(['border-color', 'box-shadow']),
    },
}))(InputBase);
