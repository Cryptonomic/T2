import React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import ArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import Button from '@mui/material/Button';

const Container = styled(Button)`
    &&& {
        padding: 0;
        &.MuiButton-textSecondary:hover {
            background-color: transparent;
        }
    }
`;

const BackCaret = styled(ArrowLeft)`
    &&& {
        height: 28px;
        width: 28px;
    }
`;

interface Props {
    label: string;
    onClick?: () => void;
}

function BackButton(props: Props) {
    const history = useHistory();
    const { label, onClick } = props;
    function goBack() {
        if (!onClick) {
            history.goBack();
        } else {
            onClick();
        }
    }
    return (
        <Container color="secondary" disableRipple={true} onClick={goBack} startIcon={<BackCaret />}>
            {label}
        </Container>
    );
}

export default BackButton;
