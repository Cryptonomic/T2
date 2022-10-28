import AddCircle from '@mui/icons-material/AddCircle';
import styled from 'styled-components';
import { ms } from '../../../../styles/helpers';
import Button from '../../../../components/Button';
import TezosIcon from '../../../../components/TezosIcon';

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
    margin-left: 20px;
    padding: 30px;
`;

export const MessageContainer = styled.div`
    display: flex;
    justify-content: left;
    align-items: flex-start;
    height: 30px;
    width: 100%;
    color: #4e71ab;
    font-weight: 300;
`;

export const MessageContainerLink = styled.a`
    color: #4e71ab;
`;

export const InfoIcon = styled(TezosIcon)`
    font-size: ${ms(2)};
    padding: 1px 7px 0px 0px;
`;

export const RowContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
`;
