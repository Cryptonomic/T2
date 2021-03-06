import React, { useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import styled from 'styled-components';

import { Vault } from '../../../../types/general';
import { RootState } from '../../../../types/store';
import { getTokenSelector } from '../../../duck/selectors';

import ArtPiece from './piece';

export const Container = styled.section`
    height: 100%;
    width: 100%;
    padding-top: 20px;
`;

type ArtGalleryProps = {
    collection: any[]; // TODO: type
};

const ArtGallery = (props: ArtGalleryProps) => {
    const { collection } = props;

    // The oven being operated on.
    const [activeOven, setActiveOven] = useState('');

    const identities = useSelector((state: RootState) => state.wallet.identities, shallowEqual);

    const selectedToken = useSelector(getTokenSelector);

    const activeIdentity = identities[0];

    const dispatch = useDispatch();

    const ovenForAddress = (ovenAddress, vaultList): Vault | undefined => {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < vaultList.length; i++) {
            const oven = vaultList[i];
            if (oven.ovenAddress === ovenAddress) {
                return oven;
            }
        }

        return undefined;
    };

    const pieces = collection.map((p: any) => {
        console.log('ArtGallery', p);
        return <ArtPiece key={p.piece} objectId={p.piece} />;
    });

    return <Container>{pieces}</Container>;
};

export default ArtGallery;
