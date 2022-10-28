import styled from 'styled-components';

export const Container = styled.section`
    height: 100%;
    background-color: ${({ theme: { colors } }) => colors.white};
    display: flex;
    flex-direction: column;
    flex: 1;
`;

export const SectionContainer = styled.div``;
