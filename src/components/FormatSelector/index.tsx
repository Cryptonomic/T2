import React from 'react';
import styled from 'styled-components';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import { withTranslation, WithTranslation } from 'react-i18next';
import { TezosParameterFormat } from 'conseiljs';
import CustomSelect from '../CustomSelect';
import TezosIcon from '../TezosIcon';

const TezosChainFormatArrary: TezosParameterFormat[] = [
  TezosParameterFormat.Micheline,
  TezosParameterFormat.Michelson
];

const SelectChainRenderWrapper = styled.div`
  color: ${({ theme: { colors } }) => colors.primary};
  font-size: 16px;
  font-weight: 500;
  text-transform: capitalize;
`;

const SelectChainItemWrapper = styled.div`
  margin-left: auto;
  text-transform: capitalize;
`;

const ChainItemWrapper = styled(MenuItem)`
  &&& {
    &[class*='selected'] {
      color: ${({ theme: { colors } }) => colors.accent};
    }
    color: ${({ theme: { colors } }) => colors.primary};
    width: 100%;
    font-size: 14px;
    font-weight: 400;
    box-sizing: border-box;
    height: 54px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

interface OwnProps {
  value: string;
  onChange: (val: TezosParameterFormat) => void;
}

type Props = OwnProps & WithTranslation;

const FormatSelector = (props: Props) => {
  const { t, value, onChange } = props;
  return (
    <CustomSelect
      label={t('general.nouns.format')}
      value={value}
      onChange={event => onChange(event.target.value)}
      renderValue={val => <SelectChainRenderWrapper>{val}</SelectChainRenderWrapper>}
    >
      {TezosChainFormatArrary.map(format => (
        <MenuItem key={format} value={format}>
          <ListItemIcon>
            <TezosIcon size="14px" color="accent" iconName="checkmark2" />
          </ListItemIcon>
          <Typography variant="inherit">{format}</Typography>
        </MenuItem>
      ))}
    </CustomSelect>
  );
};

export default withTranslation()(FormatSelector);
