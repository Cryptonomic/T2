import styled from 'styled-components';
import VisibilityIcon from '@mui/icons-material/VisibilityOffOutlined';
import Button from '../Button';

export const ModerationMessageContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    min-height: 280px;
    padding: 32px 16px;
    background: ${({ theme: { colors } }) => colors.gray19};
    border: 1px solid ${({ theme: { colors } }) => colors.gray20};
    box-shadow: 0px 1px 2px rgba(225, 225, 225, 0.44);
    border-radius: 8px;
`;

export const TopRow = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
`;

export const MessageIcon = styled(VisibilityIcon)`
    color: ${({ theme: { colors } }) => colors.gray18};
    font-size: 43px !important;
`;

export const Message = styled.p`
    color: ${({ theme: { colors } }) => colors.gray18};
    text-align: center;
    font-weight: bold;
`;

export const StyledButton = styled(Button)`
    &&& {
        padding: 2px 16px;
        font-weight: 500;
    }
`;
