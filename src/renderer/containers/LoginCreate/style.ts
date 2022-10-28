import styled from 'styled-components';
import Fab from '@mui/material/Fab';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

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
`;

export const CreateFileSelector = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    margin-bottom: 1.625rem;
`;

export const FileDescription = styled.span`
    color: ${({ theme: { colors } }) => colors.gray16};
    letter-spacing: -0.71px;
`;

export const FileDescriptionArrowIcon = styled(TezosIcon)`
    font-size: 0.625rem;
    margin: 3px 0px 0px 10px;
`;

export const ButtonAddIcon = styled(AddIcon)`
    color: ${({ theme: { colors } }) => colors.blue1};
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
    margin: 0 0 1.625rem 0;
`;

export const WalletDescription = styled.div`
    font-size: 18px;
    font-weight: 300;
    line-height: 1.5;
    letter-spacing: 0.75px;
    color: #1e1313;
    max-width: 659px;
    margin-bottom: 2.5rem;
`;

export const ActionButton = styled(Fab)`
    &&& {
        margin-left: auto;
        width: 194px;
    }
`;

export const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

export const PasswordsContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
`;

export const CreateFileEmptyIcon = styled.img`
    height: 2.6875rem;
    margin-right: 7px;
`;

export const CreateFileButton = styled(Button)`
    &&& {
        width: 160px;
        height: 38px;
        border-radius: 25px;
        border: 2px solid ${({ theme: { colors } }) => colors.blue7}
        color: ${({ theme: { colors } }) => colors.blue7}
        margin-left: auto;
    }
`;

export const WalletFileSection = styled.div`
    display: flex;
    align-items: center
    text-align: center;
`;

export const BackButtonContainer = styled.div`
    margin-bottom: 1.875rem;
`;
