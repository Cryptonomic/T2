import React from 'react';
import styled from 'styled-components';

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

    const pieces = collection.map((p: any) => {
        return <ArtPiece key={p.piece} objectId={p.piece} amount={p.amount} price={p.price} receivedOn={p.receivedOn} action={p.action} />;
    });

    return <Container>{pieces}</Container>;
};

export default ArtGallery;
