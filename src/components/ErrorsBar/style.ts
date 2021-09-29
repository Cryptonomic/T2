import styled from 'styled-components';

export const ErrorsBar = styled.div`
    width: 100%;
    padding: 16px;
    background: ${({ theme: { colors } }) => colors.error};
    color: ${({ theme: { colors } }) => colors.white};
    min-height: 22px;
`;

export const ErrorMessage = styled.p`
    margin: 0;
    opacity: 0.8;
`;

export const ErrorsList = styled.ul`
    width: 100%;
    margin: 0;
    margin-bottom: 5px;
    padding-left: 24px;
    opacity: 0.8;
`;
