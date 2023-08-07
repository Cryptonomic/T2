import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import { ChangeButton, ControlsContainer, LabelText, LabelWrapper, Of, QuantityInputContainer, Value } from './style';
import { QuantityInputProps } from './types';

/**
 * Render the Quantity selector with "+" and "-" buttons.
 *
 * The component adds the hidden input to DOM with a given name and current value.
 *
 * @param {string} [name = 'quantity'] - the input name
 * @param {string} [label] - the label
 * @param {number} [min] - the minimum value
 * @param {number} [max] - the maximum value
 * @param {number} [step = 1] - the step
 * @param {number} [value] - the value
 * @param {(value: number) => void} [onChange] - on the value change
 */
const QuantityInput: FunctionComponent<QuantityInputProps> = ({ name = 'quantity', label, min, max, step = 1, value, onChange }) => {
    const { t } = useTranslation();

    const changeValue = (newValue: number) => {
        if (!onChange) {
            return;
        }
        if (max && newValue > max) {
            onChange(max);
        } else if (min && newValue < min) {
            onChange(min);
        } else {
            onChange(newValue);
        }
    };

    return (
        <QuantityInputContainer>
            <LabelWrapper htmlFor={name}>
                <LabelText>{label}</LabelText>
                <input name={name} type="hidden" value={value} />
                <ControlsContainer>
                    <ChangeButton size="small" onClick={() => changeValue(value ? value - step : min || 0)} disabled={!!(value && min && value <= min)}>
                        <RemoveIcon />
                    </ChangeButton>
                    <Value>{value}</Value>
                    <ChangeButton size="small" onClick={() => changeValue(value ? value + step : max || 0)} disabled={!!(value && max && value >= max)}>
                        <AddIcon />
                    </ChangeButton>
                    <Of>
                        {t('general.prepositions.of')} {max}
                    </Of>
                </ControlsContainer>
            </LabelWrapper>
        </QuantityInputContainer>
    );
};

export default QuantityInput;
