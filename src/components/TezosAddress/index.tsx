import React from 'react';
import styled from 'styled-components';

import { ms } from '../../styles/helpers';
import CopyIcon from '../CopyButton';

const Address = styled.span<{ color: string; size: string; weight: number }>`
    display: flex;
    align-items: center;
    color: ${({ color, theme: { colors } }) => colors[color]};
    font-weight: ${({ weight }) => weight};
    font-size: ${({ size }) => size || ms(2)};
    margin: 0 0 0 0;
    -webkit-app-region: no-drag;
`;

const FirstPart = styled.span<{ color: string }>`
    font-weight: 500;
    color: ${({ color, theme: { colors } }) => colors[color]};
    user-select: text;
    cursor: text;
`;

const SecondPart = styled.span`
    user-select: text;
    cursor: text;
`;

interface Props {
    address: string;
    weight: number;
    color: string;
    size: string;
    text?: string;
    color2?: string;
}

const TezosAddress = (props: Props) => {
    const { address, weight, size, color, text, color2 } = props;

    if (!address) {
        return <span />;
    }

    return (
        <Address weight={weight} color={color} size={size}>
            <span>
                <FirstPart color={color2 || color}>{address.slice(0, 3)}</FirstPart>
                <SecondPart>{address.slice(3)}</SecondPart>
            </span>
            {text && <CopyIcon text={text} color={color} />}
        </Address>
    );
};

export default TezosAddress;
