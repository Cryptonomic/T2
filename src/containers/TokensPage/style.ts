import styled from 'styled-components';
import mStyled from '@material-ui/styles/styled';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

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

export const Box = styled.div`
    width: 208px;
    min-height: 193px;
    background-color: #f6f8fa;
    border: 1px solid #d8e4fc;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    padding: 16px 13px 29px 16px;
`;

export const BoxIcon = styled.div`
    width: 100%;
    display: flex;
    align-self: center;
    width: 40px;
    height: 40px;
`;

export const Img = styled.img`
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
