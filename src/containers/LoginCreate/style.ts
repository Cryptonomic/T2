import styled, { css } from 'styled-components';
import Button from '../../components/Button';
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
  color: #1a325f;
  font-size: 36px;
  font-weight: 300;
  margin: 1.5rem 0 0.75rem 0;
`;

export const WalletDescription = styled.div`
  font-size: 18px;
  font-weight: 300;
  line-height: 27px;
  letter-spacing: 0.7px;
  color: #1e1313;
  max-width: 659px;
`;

export const ActionButtonContainer = styled.div`
  width: 194px;
  margin-top: 37px;
  display: flex;
  align-self: center;
`;

export const ActionButton = styled(Button)`
  width: 194px;
  height: 50px;
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
  padding-left: 0 !important;
  padding-right: 0 !important;
  width: 9.18rem !important;
  margin-bottom: 1.6rem !important;
`;

export const WalletFileSection = styled.div`
  text-align: center;
  margin-bottom: 1.125rem;
`;
