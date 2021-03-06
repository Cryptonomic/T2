import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { openLink } from '../../../../utils/general';
import { ms } from '../../../../styles/helpers';

import { getPieceInfo } from '../../thunks';

import { InfoLink, Image, LinkIcon, PieceContainer, PieceId, PieceName, PieceDescription, PieceCreator, PieceDisplay } from './style';

interface Props {
    objectId: number;
}

function ArtPiece(props: Props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const { objectId } = props;

    const pieceInfo = getPieceInfo(objectId);

    return (
        <PieceContainer>
            <PieceName>
                {pieceInfo.name}
                <PieceId>#{objectId}</PieceId>
            </PieceName>

            <PieceDescription>{pieceInfo.description}</PieceDescription>

            <PieceCreator>Issued by {pieceInfo.creators}</PieceCreator>

            {!['image/png', 'image/jpeg'].includes(pieceInfo.artifactType) && (
                <PieceDisplay>
                    <InfoLink onClick={() => openLink(`https://www.hicetnunc.xyz/objkt/${objectId}`)}>
                        Unsupported artifact type, view on hic et nunc
                        <LinkIcon iconName="new-window" color="black" onClick={() => openLink(`https://www.hicetnunc.xyz/objkt/${objectId}`)} />
                    </InfoLink>
                </PieceDisplay>
            )}

            {['image/png', 'image/jpeg'].includes(pieceInfo.artifactType) && (
                <PieceDisplay>
                    <Image style={{ minWidth: '20%', maxWidth: 500, minHeight: '10%', maxHeight: 350 }} src={pieceInfo.artifactUrl} />
                    <InfoLink onClick={() => openLink(`https://www.hicetnunc.xyz/objkt/${objectId}`)}>
                        View on hic et nunc
                        <LinkIcon iconName="new-window" color="black" onClick={() => openLink(`https://www.hicetnunc.xyz/objkt/${objectId}`)} />
                    </InfoLink>
                </PieceDisplay>
            )}
        </PieceContainer>
    );
}

export default ArtPiece;
