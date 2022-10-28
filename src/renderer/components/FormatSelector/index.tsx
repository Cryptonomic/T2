import React from 'react';
import styled from 'styled-components';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { TezosParameterFormat } from 'conseiljs';
import CustomSelect from '../CustomSelect';
import TezosIcon from '../TezosIcon';

const TezosChainFormatArrary: TezosParameterFormat[] = [TezosParameterFormat.Micheline, TezosParameterFormat.Michelson];

const SelectChainRenderWrapper = styled.div`
    color: ${({ theme: { colors } }) => colors.primary};
    font-size: 16px;
    font-weight: 500;
    text-transform: capitalize;
`;

const ItemIconWrapper = styled(ListItemIcon)`
    &&& {
        min-width: 25px;
    }
`;

const Empty = styled.div`
    width: 25px;
`;

const ItemWrapper = styled(Typography)`
    text-transform: capitalize;
`;

interface Props {
    value: TezosParameterFormat;
    onChange: (val: TezosParameterFormat) => void;
}

const FormatSelector = (props: Props) => {
    const { value, onChange } = props;
    const { t } = useTranslation();
    return (
        <CustomSelect
            label={t('general.nouns.format')}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            renderValue={(val) => <SelectChainRenderWrapper>{val}</SelectChainRenderWrapper>}
        >
            {TezosChainFormatArrary.map((format) => (
                <MenuItem key={format} value={format}>
                    {format === value ? (
                        <ItemIconWrapper>
                            <TezosIcon size="14px" color="accent" iconName="checkmark2" />
                        </ItemIconWrapper>
                    ) : (
                        <Empty />
                    )}
                    <ItemWrapper variant="inherit">{format}</ItemWrapper>
                </MenuItem>
            ))}
        </CustomSelect>
    );
};

export default FormatSelector;
