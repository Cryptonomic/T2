import styled from 'styled-components';
import { lighten } from 'polished';

import Modal from '@mui/material/Modal';

import Button from '../../components/Button';
import { ms } from '../../styles/helpers';
import TezosIcon from '../../components/TezosIcon';

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    padding: 0 20px 20px 20px;
    position: relative;
`;

export const AmountContainer = styled.div`
    width: 47%;
    position: relative;
`;

export const FeeContainer = styled.div`
    width: 47%;
    display: flex;
    height: 64px;
`;

export const PasswordButtonContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    height: 85px;
    margin-top: auto;
    width: 100%;
`;

export const InvokeButton = styled(Button)`
    width: 194px;
    height: 50px;
    margin-bottom: 0px;
    margin-left: auto;
    padding: 0;
`;

export const SmallButton = styled(Button)`
    width: 84px;
    height: 24px;
    align-self: center;
    margin-top: auto;
`;

export const RowContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
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

export const InfoIcon = styled(TezosIcon)`
    font-size: ${ms(2)};
    padding: 1px 7px 0px 0px;
`;

export const InfoContainer = styled.div`
    display: flex;
    justify-content: left;
    align-items: center;
    height: 60px;
    width: 100%;
`;

/**
 * The modal wrapper
 */
export const ModalWrapper = styled(Modal)`
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: auto;
`;

/**
 * The modal box
 */
export const ModalBox = styled.div`
    background: ${({ theme: { colors } }) => colors.white};
    box-shadow: 0 2px 16px -4px ${({ theme: { colors } }) => lighten(0.4, colors.black3)};
    width: 1000px;
    max-width: calc(100% - 16px);
    overflow: auto;
    max-height: calc(100vh - 16px);
`;

/**
 * Container wrapping the modal content
 */
export const ModalContainer = styled.div`
    display: flex;
    padding: 30px 40px;
`;
