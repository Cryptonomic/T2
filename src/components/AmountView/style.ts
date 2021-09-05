import styled from 'styled-components';

import { ms } from '../../styles/helpers';
import TezosIcon from '../TezosIcon';

interface AmountProps {
    size?: any;
    weight?: any;
    style?: any;
    className?: string;
    color?: string;
}

export const Amount = styled.span<Pick<AmountProps, 'size' | 'weight' | 'style' | 'className' | 'color'>>`
    color: ${({ color, theme: { colors } }) => (color ? colors[color] : colors.primary)};
    font-size: ${({ size }) => size};
    font-weight: ${({
        weight = 'normal',
        theme: {
            typo: { weights },
        },
    }) => weights[weight]};
    display: inline-flex;
    align-items: center;
    letter-spacing: 0.6px;
    -webkit-app-region: no-drag;

    span {
        line-height: 0;
    }
`;

export const SelectableText = {
    userSelect: 'text',
    cursor: 'text',
};

export const NonSelectableText = {
    cursor: 'inherit',
};

export const Icon = styled(TezosIcon)`
    line-height: 1;
`;

export const CopyContent = styled.span`
    display: flex;
    align-items: center;
    font-size: ${ms(0)};
`;
