import React from 'react';

import { Oven } from '../../../../types/general';

import OvenItem from './OvenItem';

import { Container } from '../style';

type OvenListProps = {
    ovens: Oven[];
};

const OvenList = (props: OvenListProps) => {
    const { ovens } = props;

    const ovenItems = ovens.map((oven: Oven) => {
        return <OvenItem key={oven.ovenAddress} address={oven.ovenAddress} delegate={oven.baker} balance={oven.ovenBalance} />;
    });

    return <Container>{ovenItems}</Container>;
};

export default OvenList;
