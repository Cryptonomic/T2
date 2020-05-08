import styled from 'styled-components';
import Fab from '@material-ui/core/Fab';
import Button from '@material-ui/core/Button';
import TezosIcon from '../../components/TezosIcon/';

export const WalletFileName = styled.div`
    font-size: 15px;
    font-weight: 300;
    letter-spacing: -0.7px;
    color: ${({ theme: { colors } }) => colors.accent};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 10rem;
`;

export const CheckIcon = styled(TezosIcon)`
    display: block;
    margin-bottom: 15px;
`;

export const CreateFileSelector = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-direction: column;
    border-width: 1.5px;
    border-style: dashed;
    border-color: ${({ theme: { colors } }) => colors.gray9};
    background: white;
    border-radius: 5px;
    width: 13rem;
    height: 13.5rem;
    margin-right: 2.37rem;
`;

export const CreateContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex-grow: 1;
`;

export const WalletContainers = styled.div`
    display: flex;
    flex-direction: column;
    margin: 0 30px;
`;

export const WalletTitle = styled.h3`
    color: ${({ theme: { colors } }) => colors.primary};
    font-size: 36px;
    font-weight: normal;
    line-height: 34px;
    letter-spacing: 1.5px;
    margin: 0 0 0.75rem 0;
`;

export const WalletDescription = styled.div`
    font-size: 18px;
    font-weight: 300;
    line-height: 27px;
    letter-spacing: 0.7px;
    color: #1e1313;
    max-width: 659px;
`;

export const ActionButton = styled(Fab)`
    &&& {
        margin-top: 39px;
        width: 194px;
    }
`;

export const FormContainer = styled.div`
    display: flex;
    margin-top: 1rem;
`;

export const PasswordsContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
`;

export const CreateFileEmptyIcon = styled.img`
    height: 6.75rem;
    margin-bottom: 1.18rem;
`;

export const CreateFileButton = styled(Button)`
    &&& {
        width: 147px;
        border-radius: 20px;
        margin-bottom: 1.6rem;
    }
`;

export const WalletFileSection = styled.div`
    text-align: center;
    margin-bottom: 1.125rem;
`;

export const BackButtonContainer = styled.div`
    margin-bottom: 30px;
`;
