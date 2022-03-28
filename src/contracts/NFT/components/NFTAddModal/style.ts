import styled from 'styled-components';

import Button from '../../../../components/Button';

export const InputAddressContainer = styled.div`
    padding: 16px 76px;
    height: 74px;
    margin-bottom: 27px;
`;

export const ModalHeader = styled.p`
    padding: 0 76px;
    color: ${({ theme: { colors } }) => colors.primary} !important;
`;

export const AddNFTButtonContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 42px;
    padding: 29px 56px 47px 0;
    background-color: ${({ theme: { colors } }) => colors.gray1};
    height: 124px;
`;

export const AddButton = styled(Button)`
    width: 194px;
    height: 48px;
    margin-left: auto;
`;
