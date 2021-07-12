import styled from 'styled-components';
import Button from '../../../../components/Button';

export const Container = styled.div`
    padding: 0 32px 20px;
    .title {
        font-weight: 500;
        font-size: 18px;
        line-height: 21px;
        margin-top: 24px;
    }
    .items {
        max-height: 480px;
        overflow-y: scroll;
    }
`;

export const AmountContainer = styled.div`
    width: 100%;
    position: relative;
`;

export const PasswordContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    height: 100px;
    margin-top: auto;
    width: 100%;
`;

export const InvokeButton = styled(Button)`
    width: 194px;
    height: 50px;
    margin-bottom: 10px;
    margin-left: auto;
    padding: 0;
`;
