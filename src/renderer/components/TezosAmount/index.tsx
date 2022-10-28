import React from 'react';
import styled from 'styled-components';
import TezosIcon from '../TezosIcon';
import CopyIcon from '../CopyButton';
import Tooltip from '../Tooltip';
import { formatAmount } from '../../utils/currency';
import { ms } from '../../styles/helpers';

interface AmountProps {
    size?: any;
    weight?: any;
    style?: any;
    className?: string;
    color?: string;
    format?: any;
}

const Amount = styled.span<Pick<AmountProps, 'size' | 'weight' | 'style' | 'className' | 'color' | 'format'>>`
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

const SelectableText = {
    userSelect: 'text',
    cursor: 'text',
};

const Icon = styled(TezosIcon)`
    line-height: 1;
`;

const CopyContent = styled.span`
    display: flex;
    align-items: center;
    font-size: ${ms(0)};
`;

interface ContentProps {
    formatedBalance: string;
}

const Content = (props: ContentProps) => {
    const { formatedBalance } = props;
    return (
        <CopyContent>
            {formatedBalance}
            <CopyIcon text={formatedBalance} color="primary" />
        </CopyContent>
    );
};

interface Props {
    amount: number;
    color: string;
    iconName?: string;
    size?: string;
    weight: string;
    format: number;
    showTooltip?: boolean;
    symbol?: string;
}

const TezosAmount = (props: Props) => {
    const { size, color, amount, iconName, weight, showTooltip, format, symbol } = props;
    function getRealValue() {
        if (!!symbol) {
            return {
                strBalance: amount.toString(),
                view: amount.toString(),
            };
        }

        const formatStrBal = `${formatAmount(amount)}`;
        const viewBal = formatAmount(amount, format);
        return {
            strBalance: formatStrBal,
            view: viewBal,
        };
    }

    function getIcon() {
        if (!!symbol) {
            return ` ${symbol}`;
        }

        if (!!iconName) {
            return <Icon size={size} color={color} iconName={iconName} />;
        }
        return null;
    }
    const { strBalance, view } = getRealValue();
    return showTooltip ? (
        <Tooltip position="bottom" content={<Content formatedBalance={strBalance} />}>
            <Amount color={color} size={size} weight={weight} style={SelectableText}>
                {view}
                {getIcon()}
            </Amount>
        </Tooltip>
    ) : (
        <Amount color={color} size={size} weight={weight} format={format} style={SelectableText}>
            {view}
            {getIcon()}
        </Amount>
    );
};

TezosAmount.defaultProps = {
    amount: 0,
    iconName: 'tezos',
    size: ms(0),
    weight: 'bold',
    color: 'primary',
    format: 6,
};

export default TezosAmount;
