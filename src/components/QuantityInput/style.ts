import styled from 'styled-components';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';

export const ControlsContainer = styled.div`
    display: flex;
    align-items: center;
`;

export const ChangeButton = styled(IconButton)`
    cursor: pointer;

    &&& {
        background: ${({ theme: { colors } }) => colors.accent};
        color: white;
        cursor: pointer;

        span,
        svg,
        path {
            cursor: pointer;
        }

        &:hover {
            opacity: 0.7;
        }

        &:disabled {
            opacity: 0.2;
        }
    }
`;

export const LabelText = styled.span`
    display: block;
    margin-bottom: 8px;
    font-size: 12px;
    color: ${({ theme: { colors } }) => colors.gray5};
    font-weight: 400;
`;

export const LabelWrapper = styled(InputLabel)`
    &&& {
        color: ${({ theme: { colors } }) => colors.black3};
    }
`;

export const Of = styled.span`
    margin-left: 8px;
`;

export const QuantityInputContainer = styled.div`
    display: flex;
`;

export const Value = styled.span`
    margin: 0 8px;
`;
