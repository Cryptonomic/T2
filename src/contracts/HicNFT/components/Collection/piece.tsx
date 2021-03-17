import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { openLink, formatDate } from '../../../../utils/general';
import { formatAmount } from '../../../../utils/currency';

import { getPieceInfo } from '../../thunks';

import { InfoLink, Image, LinkIcon, PieceContainer, PieceId, PieceName, PieceDescription, PieceCreator, PieceDisplay, PieceInfo } from './style';

interface Props {
    objectId: number;
    amount: number;
    price: number;
    receivedOn: Date;
    action: string;
}

function ArtPiece(props: Props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const { objectId, amount, price, receivedOn, action } = props;

    const pieceInfo = getPieceInfo(objectId);
    const formattedPrice = formatAmount(price, 2);
    const formattedDate = formatDate(receivedOn);

    return (
        <PieceContainer>
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
                </PieceDisplay>
            )}

            <PieceInfo>
                <PieceName>
                    {pieceInfo.name}
                    <PieceId>#{objectId}</PieceId>
                    {amount > 1 && <PieceId>{amount} copies</PieceId>}
                </PieceName>

                <PieceDescription>{pieceInfo.description}</PieceDescription>

                <PieceCreator>Issued by {pieceInfo.creators}</PieceCreator>

                <PieceCreator>
                    {action} {formattedDate.toString()}
                    {price > 0 && (
                        <>
                            {' '}
                            for {formattedPrice} {'\ua729'}
                        </>
                    )}
                </PieceCreator>

                {['image/png', 'image/jpeg'].includes(pieceInfo.artifactType) && (
                    <InfoLink onClick={() => openLink(`https://www.hicetnunc.xyz/objkt/${objectId}`)}>
                        <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>View on hic et nunc</span>
                        <LinkIcon iconName="new-window" color="black" onClick={() => openLink(`https://www.hicetnunc.xyz/objkt/${objectId}`)} />
                    </InfoLink>
                )}
            </PieceInfo>
        </PieceContainer>
    );
}

export default ArtPiece;
