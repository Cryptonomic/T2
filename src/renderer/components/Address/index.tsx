import React from 'react';
import styled from 'styled-components';
import { darken } from 'polished';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';

import { ms } from '../../styles/helpers';

import AmountView from '../AmountView';
import TezosIcon from '../TezosIcon';
import Tooltip from '../Tooltip';

const Container = styled.div<{ isActive: boolean | undefined }>`
    border-bottom: 1px solid ${({ theme: { colors } }) => darken(0.1, colors.white)};
    padding: ${ms(-2)} ${ms(2)};
    cursor: pointer;
    background: ${({ isActive, theme: { colors } }) => {
        return isActive ? colors.accent : colors.white;
    }};
    display: flex;
    flex-direction: column;
`;

const AddressFirstLine = styled.span<{ isActive: boolean | undefined }>`
    font-weight: 700;
    color: ${({ isActive, theme: { colors } }) => (isActive ? colors.white : colors.secondary)};
`;

const AddressSecondLine = styled.span<{ isActive: boolean | undefined }>`
    color: ${({ isActive, theme: { colors } }) => (isActive ? colors.white : colors.primary)};
    font-weight: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const AddressLabelIcon = styled(TezosIcon)`
    padding: 0 ${ms(-6)} 0 0;
`;

const AddressesTitle = styled.div`
    display: flex;
    align-items: center;
    line-height: 1.5;
`;

const AddressLabel = styled.div`
    flex: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
`;

const TooltipContainer = styled.div`
  color: ${({ theme: { colors } }) => colors.primary};
  font-weight: 100};
  font-size: ${ms(-1)};
  max-width: ${ms(13)};
  position
`;

const TooltipTitle = styled.p`
    font-weight: 500;
    font-size: ${ms(0)};
    margin: 0 0 ${ms(-4)} 0;
`;

function ManagerAddressTooltip({ t }) {
    return (
        <TooltipContainer>
            <TooltipTitle>{t('components.address.manager_address')}</TooltipTitle>
            {t('components.tooltips.manager_tooltips_description')}
        </TooltipContainer>
    );
}

const getFirstLine = (isManager, isContract, isActive, index, accountId, t) => {
    if (isManager) {
        return (
            <AddressFirstLine isActive={isActive}>
                <AddressesTitle>
                    <AddressLabelIcon iconName="manager" size={ms(0)} color={isActive ? 'white' : 'secondary'} />
                    <AddressLabel>{t('components.address.manager_address')}</AddressLabel>
                    <Tooltip position="bottom" content={<ManagerAddressTooltip t={t} />}>
                        <IconButton size="small" color="primary">
                            <TezosIcon iconName="help" size={ms(0)} color={isActive ? 'white' : 'secondary'} />
                        </IconButton>
                    </Tooltip>
                </AddressesTitle>
            </AddressFirstLine>
        );
    }

    let displayTxt = t('components.address.delegated_address', { index: index + 1 });
    if (isContract) {
        displayTxt = `${accountId.slice(0, 6)}...${accountId.slice(accountId.length - 6, accountId.length)}`;
    }

    return (
        <AddressFirstLine isActive={isActive}>
            <AddressesTitle>
                <AddressLabelIcon iconName="smart-address" size={ms(0)} color={isActive ? 'white' : 'secondary'} />
                {displayTxt}
            </AddressesTitle>
        </AddressFirstLine>
    );
};

interface Props {
    isContract?: boolean;
    isManager?: boolean;
    isActive?: boolean;
    balance?: number;
    index?: number;
    accountId?: string;
    onClick?: () => void;
}

const Address: React.SFC<Props> = (props) => {
    const { t } = useTranslation();
    const { isManager, isContract, isActive, balance, index, accountId, onClick } = props;
    const firstLine = getFirstLine(isManager, isContract, isActive, index, accountId, t);

    return (
        <Container isActive={isActive} onClick={onClick}>
            {firstLine}
            <AddressSecondLine isActive={isActive}>
                <AmountView color={isActive ? 'white' : 'primary'} size={isManager ? ms(-0.7) : ms(0)} amount={balance} scale={6} precision={6} round={2} />
            </AddressSecondLine>
        </Container>
    );
};

export default Address;
