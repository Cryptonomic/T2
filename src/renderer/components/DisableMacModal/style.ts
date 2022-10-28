import styled from 'styled-components';

import Button from '../Button';

export const ModalDes = styled.p`
    padding: 0 76px;
    font-weight: 300;
    color: ${({ theme: { colors } }) => colors.primary} !important;
`;

export const ButtonContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 42px;
    padding: 29px 56px 47px 0;
    background-color: ${({ theme: { colors } }) => colors.gray1};
    height: 124px;
`;

export const OkButton = styled(Button)`
    width: 194px;
    height: 48px;
    margin-left: auto;
`;

export const Link = styled.span`
    text-decoration: underline;
    cursor: pointer;
`;
