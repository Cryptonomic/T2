import AddCircle from '@material-ui/icons/AddCircle';
import styled from 'styled-components';
import { ms } from '../../../../styles/helpers';
import Button from '../../../../components/Button';

export const AddCircleWrapper = styled(AddCircle)<{ active: number }>`
    &&& {
        fill: #7b91c0;
        width: ${ms(1.5)};
        height: ${ms(1.5)};
        opacity: ${({ active }) => (active ? 1 : 0.5)};
        cursor: ${({ active }) => (active ? 'pointer' : 'default')};
        margin-right: ${({ active }) => (active ? '5px' : '0px')};
    }
`;

export const InvokeButton = styled(Button)`
    width: 194px;
    height: 50px;
    margin-bottom: 0px;
    margin-left: auto;
    padding: 0;
`;
