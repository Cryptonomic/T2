import styled from 'styled-components';
import { lighten } from 'polished';

import Button from '../../../components/Button';
import { ms } from '../../../styles/helpers';

export const Container = styled.section`
    flex-grow: 1;
    background-color: white;
`;

export const Tab = styled(Button)<{ isActive: boolean; ready: boolean }>`
    background: ${({ isActive, theme: { colors } }) => (isActive ? colors.white : colors.accent)};
    color: ${({ isActive, theme: { colors } }) => (isActive ? colors.primary : lighten(0.4, colors.accent))};
    cursor: ${({ ready }) => (ready ? 'pointer' : 'initial')};
    text-align: center;
    font-weight: 500;
    padding: ${ms(-1)} ${ms(1)};
    border-radius: 0;
`;

export const TabList = styled.div<{ count: number }>`
    background-color: ${({ theme: { colors } }) => colors.accent};
    display: grid;
    grid-template-columns: ${({ count }) => (count > 4 ? `repeat(${count}, 1fr)` : 'repeat(4, 1fr)')};
    grid-column-gap: 50px;
`;

export const TabText = styled.span<{ ready: boolean }>`
    opacity: ${({ ready }) => (ready ? '1' : '0.5')};
`;

export const SectionContainer = styled.div`
    display: flex;
    flex-direction: column;
    background-color: white;
    padding: ${ms(2)};
    min-height: 400px;
`;
