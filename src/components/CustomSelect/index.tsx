import React from 'react';
import styled from 'styled-components';
import SelectField from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

const SelectContainer = styled(FormControl)`
    width: 100%;
`;

const LabelWrapper = styled(InputLabel)`
  &&& {
    .Mui-focused {
      color: ${({ theme: { colors } }) => colors.gray3};
    }
    color: rgba(0, 0, 0, 0.38);
    font-size: 16px;
  }
}`;

const SelectWrapper = styled(SelectField)`
    &&& {
        .MuiSelect-select {
            display: flex;
            align-items: center;
            padding-top: 4px;
            padding-bottom: 4px;
            &:focus {
                background: ${({ theme: { colors } }) => colors.transparent};
            }
        }

        &:before {
            border-bottom: solid 1px rgba(0, 0, 0, 0.12);
        }
        &:after {
            border-bottom-color: ${({ theme: { colors } }) => colors.accent};
        }
        &:hover:before {
            border-bottom: solid 2px ${({ theme: { colors } }) => colors.accent} !important;
        }
        color: ${({ theme: { colors } }) => colors.primary};
        font-size: 16px;
        font-weight: 300;
    }
`;

interface Props {
    label: string;
    value: string | number | object;
    children?: React.ReactNode;
    renderValue?: (val: any) => React.ReactNode;
    onChange: (event: any) => void;
}

const CustomSelect = (props: Props) => {
    const { label, value, children, onChange, renderValue, ...others } = props;
    return (
        <SelectContainer>
            <LabelWrapper variant="standard">{label}</LabelWrapper>
            <SelectWrapper variant="standard" value={value} onChange={onChange} renderValue={renderValue} {...others}>
                {children}
            </SelectWrapper>
        </SelectContainer>
    );
};

export default CustomSelect;
