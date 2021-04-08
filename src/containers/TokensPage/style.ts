import styled from 'styled-components';
import mStyled from '@material-ui/styles/styled';
import { withStyles } from '@material-ui/styles';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import Grid from '@material-ui/core/Grid';

import { ms } from '../../styles/helpers';

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
`;

export const LinkIcon = mStyled(OpenInNewIcon)({
    fontSize: '12px',
    marginLeft: '5px',
});

export const Box = withStyles({
    root: {
        maxWidth: '208px',
        minWidth: '208px',
        minHeight: '193px',
        backgroundColor: '#f6f8fa',
        border: '1px solid #d8e4fc',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 13px 29px 16px',
        margin: '10px',
    },
})(Grid);

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

export const BoxContainer = mStyled(Grid)({});
