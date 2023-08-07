import styled from 'styled-components';

export const WrapPassword = styled.div`
    margin-top: 3px;
`;

export const OperationDetailHeader = styled.div`
    font-weight: 400;
    color: rgba(0, 0, 0, 0.38);
    font-size: 12px;
    float: left;
`;

export const LabelText = styled.span`
    display: block;
    margin-bottom: 0px;
    font-size: 12px;
    color: ${({ theme: { colors } }) => colors.gray5};
    font-weight: 400;
`;
