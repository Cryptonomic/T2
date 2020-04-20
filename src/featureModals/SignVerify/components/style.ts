import styled from 'styled-components';
import Snackbar from '@material-ui/core/Snackbar';
import Button from '../../../components/Button';

export const Container = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    padding-bottom: 50px;
`;

export const MainContainer = styled.div`
    width: 100%;
    padding: 40px 40px 30px 40px;
`;

export const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60px;
    margin-top: auto;
    padding: 0 40px;
`;

export const InvokeButton = styled(Button)`
    width: 194px;
    height: 50px;
    margin-left: auto;
    padding: 0;
`;
