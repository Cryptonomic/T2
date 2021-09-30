import React, { useState } from 'react';
import Warning from '@mui/icons-material/Warning';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import TextField from '../TextField';
import { ms } from '../../styles/helpers';
import TezosIcon from '../TezosIcon';

const StyledInputContainer = styled.div`
    position: relative;
    height: 103px;
    padding-top: 16px;
    width: 45%;
`;

const CheckIcon = styled(TezosIcon)`
    position: absolute;
    top: 42px;
    right: 5px;
`;

const WarningIcon = styled(Warning)`
    &&& {
        position: absolute;
        right: 12px;
        top: 42px;
        fill: ${({ theme: { colors } }) => colors.error1};
        width: 18px;
        height: 18px;
    }
`;

interface Props {
    value: string;
    index: number;
    onValidate: (isValid: boolean) => void;
}

function SeedInput(props: Props) {
    const { index, value, onValidate } = props;
    const { t } = useTranslation();
    const [isFirst, setIsFirst] = useState(false);
    const [status, setStatus] = useState(0);

    function getLabel() {
        if (index < 19) {
            switch (`${index}`) {
                case '1':
                    return t('components.createAccountSlide.first_word', { index });
                case '2':
                    return t('components.createAccountSlide.second_word', { index });
                case '3':
                    return t('components.createAccountSlide.third_word', { index });
                default:
                    return t('components.createAccountSlide.nth_word', { index });
            }
        } else {
            switch (`${index}`.slice(-1)) {
                case '1':
                    return t('components.createAccountSlide.first_word', { index });
                case '2':
                    return t('components.createAccountSlide.second_word', { index });
                case '3':
                    return t('components.createAccountSlide.third_word', { index });
                default:
                    return t('components.createAccountSlide.nth_word', { index });
            }
        }
    }

    function changFunc(val) {
        if (!isFirst) {
            setIsFirst(true);
        }

        if (val) {
            if (val === value) {
                setStatus(3); // TODO: status enum
                onValidate(true);
            } else if (value.indexOf(val) > -1) {
                setStatus(2);
                onValidate(false);
            } else {
                setStatus(1);
                onValidate(false);
            }
        } else {
            setStatus(0);
            onValidate(false);
        }
    }

    function getIconAndError() {
        if (!isFirst) {
            return { icon: null, error: '' };
        }

        switch (
            status // TODO: status enum
        ) {
            case 0:
                return {
                    icon: <WarningIcon />,
                    error: 'components.createAccountSlide.errors.typo_error',
                };
            case 1:
                return {
                    icon: <WarningIcon />,
                    error: 'components.createAccountSlide.errors.invalid_word',
                };
            case 3:
                return {
                    icon: <CheckIcon iconName="checkmark2" size={ms(0)} color="check" />,
                    error: '',
                };
            default:
                return { icon: null, error: '' };
        }
    }

    const label = getLabel();
    const { icon, error } = getIconAndError();

    return (
        <StyledInputContainer>
            <TextField label={label} onChange={(newVal) => changFunc(newVal)} errorText={t(error)} />
            {icon}
        </StyledInputContainer>
    );
}

export default SeedInput;
