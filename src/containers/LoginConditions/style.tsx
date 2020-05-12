import styled from 'styled-components';

import { ms } from '../../styles/helpers';

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    padding: ${ms(3)} ${ms(10)};
    align-items: center;
    flex-grow: 1;
`;

export const BackButtonContainer = styled.div`
    margin-bottom: 16px;
    align-self: flex-start;
`;
