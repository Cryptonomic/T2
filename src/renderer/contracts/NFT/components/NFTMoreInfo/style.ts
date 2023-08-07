import styled from 'styled-components';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import TezosIcon from '../../../../components/TezosIcon';

export const Container = styled.form`
    display: flex;
    width: 100%;

    @media all and (max-width: 767px) {
        flex-direction: column;
    }
`;

export const Col = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 40px;
`;

export const RightCol = styled(Col)``;

export const Header = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 13px;
`;

export const Title = styled.h2`
    flex: 1;
    margin: 0;
    font-weight: 500;
`;

export const Capitalize = styled.span`
    text-transform: capitalize;
`;

export const Creator = styled.span`
    color: ${({ theme: { colors } }) => colors.black2};

    & > span {
        margin-right: 5px;
    }
`;

export const CustomDivider = styled(Divider)`
    margin-bottom: 10px !important;
`;

export const Description = styled.p`
    color: ${({ theme: { colors } }) => colors.black2};
    font-style: italic;
    margin: 13px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
`;

export const Attribute = styled.li`
    padding-bottom: 40px;

    :last-child {
        padding-bottom: 0;
    }
`;

export const AttributesList = styled.ul`
    list-style: none;
    padding-left: 0;
    margin: 0;
`;

export const AttributeLabel = styled.span`
    margin-right: 5px;
    font-size: 16px;
    color: ${({ theme: { colors } }) => colors.black2};
`;

export const AttributeValue = styled.span`
    font-size: 18px;
`;

export const StyledTezosIcon = styled(TezosIcon)`
    vertical-align: middle;
`;

export const MenuButton = styled(IconButton)`
    &&& {
        border-radius: 0;
        padding: 5px 6px;
        border: 2px solid rgba(207, 206, 206, 0.65);
        color: ${({ theme: { colors } }) => colors.black3};
    }
`;

export const StyledListItemIcon = styled(ListItemIcon)`
    &&& {
        justify-content: center;
    }
`;

export const StyledMenuItem = styled(MenuItem)`
    &&& {
        padding: 16px 6px;
        cursor: pointer !important;
        min-width: 240px !important;

        li,
        div,
        span,
        svg,
        path {
            cursor: pointer !important;
        }
    }
`;
