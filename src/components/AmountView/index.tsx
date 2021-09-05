import React from 'react';
import { BigNumber } from 'bignumber.js';

import { ms } from '../../styles/helpers';
import CopyIcon from '../CopyButton';
import Tooltip from '../Tooltip';
import { Amount, CopyContent, Icon, NonSelectableText, SelectableText } from './style';

interface ContentProps {
    formattedAmount: string;
}

const Content = (props: ContentProps) => {
    // TODO: surely this can be a shared component
    const { formattedAmount } = props;
    return (
        <CopyContent>
            {formattedAmount}
            <CopyIcon text={formattedAmount} color="primary" />
        </CopyContent>
    );
};

interface Props {
    amount: number;
    color: string;
    iconName?: string;
    size?: string;
    weight: string;
    scale: number;
    precision: number;
    round: number;
    showTooltip?: boolean;
    symbol?: string;
    selectable?: boolean;
}

const AmountView = (props: Props) => {
    const { size, color, amount, iconName, weight, showTooltip, scale, precision, round, symbol, selectable } = props;

    const textCursor = selectable === undefined || selectable ? SelectableText : NonSelectableText;

    function getRealValue() {
        return {
            fullAmount: formatAmount(true),
            truncatedAmount: formatAmount(false),
        };
    }

    function formatAmount(truncateAmount): string {
        const digits = Math.min(truncateAmount ? precision : round, 18);
        return new BigNumber(amount)
            .dividedBy(10 ** scale)
            .toNumber()
            .toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
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

    const { fullAmount, truncatedAmount } = getRealValue();

    return showTooltip ? ( // TODO: there is probably a react-ey way of doing this
        <Tooltip position="bottom" content={<Content formattedAmount={fullAmount} />}>
            <Amount color={color} size={size} weight={weight} style={textCursor}>
                {truncatedAmount}
                {getIcon()}
            </Amount>
        </Tooltip>
    ) : (
        <Amount color={color} size={size} weight={weight} style={textCursor}>
            {truncatedAmount}
            {getIcon()}
        </Amount>
    );
};

AmountView.defaultProps = {
    amount: 0,
    iconName: 'tezos',
    size: ms(0),
    weight: 'bold',
    color: 'primary',
    scale: 6,
    precision: 6,
    round: 4,
};

export default AmountView;
