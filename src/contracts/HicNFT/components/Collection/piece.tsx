import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { proxyFetch, ImageProxyServer, ImageProxyDataType } from 'nft-image-proxy';

import { imageProxyURL, imageAPIKey } from '../../../../config.json';
import { openLink, formatDate } from '../../../../utils/general';
import { formatAmount } from '../../../../utils/currency';

import { getPieceInfo } from '../../thunks';
import { setModalOpen, setModalValue } from '../../../../reduxContent/modal/actions';

import { InfoLink, Image, LinkIcon, PieceContainer, PieceId, PieceName, PieceDescription, PieceCreator, PieceDisplay, PieceInfo } from './style';
import { SmallButton } from '../../../components/style';

interface Props {
    objectId: number;
    amount: number;
    price: number;
    receivedOn: Date;
    action: string;
}

const supportedTypes = ['image/png', 'image/apng', 'image/jpeg', 'image/gif'];

function ArtPiece(props: Props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [proxiedContentURL, setProxiedContentURL] = useState('');
    const [proxyModerationMessage, setProxyModerationMessage] = useState('');

    const { objectId, amount, price, receivedOn, action } = props;

    const pieceInfo = getPieceInfo(objectId);
    const formattedPrice = formatAmount(price, 2);
    const formattedDate = formatDate(receivedOn);

    useEffect(() => {
        const _getProxyInfo = async () => {
            const server: ImageProxyServer = { url: imageProxyURL, apikey: imageAPIKey, version: '1.0.0' };

            proxyFetch(server, pieceInfo.artifactUrl, ImageProxyDataType.Json, false).then((d: any) => {
                if (d.rpc_status === 'Ok') {
                    if (d.result.moderation_status === 'Allowed') {
                        setProxiedContentURL(d.result.data);
                    } else if (d.result.moderation_status === 'Blocked') {
                        setProxyModerationMessage(`Image was hidden because of it contains the following labels: ${d.result.categories.join(', ')}`);
                    }
                } else if (d.rpc_status === 'Err') {
                    setProxiedContentURL(pieceInfo.artifactUrl);
                }
            });
        };

        if (supportedTypes.includes(pieceInfo.artifactType)) {
            _getProxyInfo();
        }
    }, [proxiedContentURL, pieceInfo]);

    const transferTrigger = () => {
        dispatch(setModalValue({ price, amount, objectId, receivedOn, info: pieceInfo }, 'piece'));
        dispatch(setModalOpen(true, 'HicNFT'));
    };

    const ignoreProxyModeration = () => {
        setProxiedContentURL(pieceInfo.artifactUrl);
        setProxyModerationMessage('');
    };

    return (
        <PieceContainer>
            {!supportedTypes.includes(pieceInfo.artifactType) && (
                <PieceDisplay>
                    <InfoLink onClick={() => openLink(`https://www.hicetnunc.xyz/objkt/${objectId}`)}>
                        Unsupported artifact type ({pieceInfo.artifactType}).&nbsp;
                        <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>View on hic et nunc</span>
                        <LinkIcon iconName="new-window" color="black" onClick={() => openLink(`https://www.hicetnunc.xyz/objkt/${objectId}`)} />
                    </InfoLink>
                </PieceDisplay>
            )}

            {supportedTypes.includes(pieceInfo.artifactType) && proxyModerationMessage === '' && (
                <PieceDisplay>
                    <Image style={{ minWidth: '20%', maxWidth: 500, minHeight: '10%', maxHeight: 350 }} src={proxiedContentURL} />
                </PieceDisplay>
            )}

            {supportedTypes.includes(pieceInfo.artifactType) && proxyModerationMessage !== '' && (
                <PieceDisplay>
                    <span>Media Proxy moderation message: {proxyModerationMessage}.</span>
                    <SmallButton buttonTheme="primary" onClick={ignoreProxyModeration}>
                        Display
                    </SmallButton>
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

                {supportedTypes.includes(pieceInfo.artifactType) && (
                    <InfoLink onClick={() => openLink(`https://www.hicetnunc.xyz/objkt/${objectId}`)}>
                        <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>View on hic et nunc</span>
                        <LinkIcon iconName="new-window" color="black" onClick={() => openLink(`https://www.hicetnunc.xyz/objkt/${objectId}`)} />
                    </InfoLink>
                )}

                <div style={{ paddingTop: '10px' }}>
                    <SmallButton buttonTheme="primary" onClick={transferTrigger}>
                        Send
                    </SmallButton>
                </div>
            </PieceInfo>
        </PieceContainer>

        //
    );
}

export default ArtPiece;
