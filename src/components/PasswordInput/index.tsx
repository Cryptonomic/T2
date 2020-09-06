import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import TextField from '../TextField';

const Container = styled.div`
    position: relative;
`;

const ShowHidePwd = styled.div`
    position: absolute;
    right: 10px;
    top: 22px;
    color: ${({ theme: { colors } }) => colors.accent};
    font-size: 12px;
    font-weight: 500;
`;

interface Props {
    label: string;
    id?: string;
    containerStyle?: object;
    password: string;
    dataSpectron?: string;
    onChange: (val: string) => void;
}

function PasswordInput(props: Props) {
    const { label, id, password, dataSpectron, onChange, containerStyle } = props;
    const { t } = useTranslation();
    const [isShowed, setIsShowed] = useState(false);
    return (
        <Container id={id} style={containerStyle}>
            <TextField data-spectron={dataSpectron} label={label} type={isShowed ? 'text' : 'password'} value={password} onChange={(newVal: string) => onChange(newVal)} right={42} />
            <ShowHidePwd style={{ cursor: 'pointer' }} onClick={() => setIsShowed(!isShowed)}>
                {t(isShowed ? 'general.verbs.hide' : 'general.verbs.show')}
            </ShowHidePwd>
        </Container>
    );
}

PasswordInput.defaultProps = {
    containerStyle: {},
};

export default PasswordInput;
