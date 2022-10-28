import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';

import LinkIcon from '@mui/icons-material/Link';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';

import { Attribute, AttributesList, AttributeLabel, AttributeValue, Capitalize, Container, Col, Creator, CustomDivider, Description, Header, MenuButton, Title, StyledListItemIcon, StyledMenuItem, StyledTezosIcon } from './style';

import { NFT_PROVIDERS } from '../../constants';

import { NFTMoreInfoProps } from '../../types';

import Media from '../../../../components/NFTMedia';

import { formatAmount } from '../../../../utils/currency';
import { openLink } from '../../../../utils/general';

/**
 * The content of the "More info" tab of the NFT modal.
 *
 * @param {NFTObject} [nftObject] - the NFT object with all details.
 */
export const NFTMoreInfo: FunctionComponent<NFTMoreInfoProps> = ({ nftObject }) => {
    const { t } = useTranslation();
    const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);

    const handleMenuClick = (event) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    const openArtifactSite = () => {
        if (nftObject?.provider === NFT_PROVIDERS.HIC_ET_NUNC) {
            // TODO: urls should be defined in token info
            openArtifactLink(`https://www.hicetnunc.art/objkt/${nftObject.objectId}`);
        } else if (nftObject?.provider === NFT_PROVIDERS.KALAMINT) {
            openArtifactLink(`https://kalamint.io/token/${nftObject.objectId}`);
        } else if (nftObject?.provider === NFT_PROVIDERS.PIXEL_POTUS) {
            openArtifactLink(`https://www.pixelpotus.com/potus/${nftObject.objectId}`);
        } else if (nftObject?.provider === NFT_PROVIDERS.TWITZ) {
            openArtifactLink(`https://twitz.vercel.app/twitz/${nftObject.objectId}`);
        } else if (nftObject?.provider === NFT_PROVIDERS.H3P) {
            openArtifactLink(`https://objkt.com/asset/h3p/${nftObject.objectId}`);
        } else if (nftObject?.provider === NFT_PROVIDERS.BYTEBLOCK) {
            openArtifactLink(`https://byteblock.art/collection/${nftObject.tokenAddress}/token/${nftObject.objectId}`);
        } else if (nftObject?.provider === NFT_PROVIDERS.FXHASH) {
            openArtifactLink(`https://www.fxhash.xyz/gentk/${nftObject.objectId}`);
        } else if (nftObject?.provider === NFT_PROVIDERS.RARIBLE) {
            openArtifactLink(`https://rarible.com/token/tezos/${nftObject.tokenAddress}:${nftObject.objectId}?tab=details`);
        } else if (nftObject?.provider === NFT_PROVIDERS.VERSUM) {
            openArtifactLink(`https://versum.xyz/token/versum/${nftObject.objectId}`);
        } else if (nftObject?.provider === NFT_PROVIDERS.OBJKT_GENERIC) {
            openArtifactLink(`https://objkt.com/asset/${nftObject.tokenAddress}/${nftObject.objectId}`);
        } else if (nftObject?.provider === NFT_PROVIDERS.DOGAMI) {
            openArtifactLink(`https://marketplace.dogami.com/dog/${nftObject.objectId}`);
        } else if (nftObject?.provider === NFT_PROVIDERS.EIGHTB) {
            openArtifactLink(`https://www.8bidou.com/listing/?id=${nftObject.objectId}`);
        }
    };

    const shortenObjectId = (objectId: number | string) => {
        const id = objectId.toString();

        if (id.length > 12) {
            return `${id.slice(0, 5)}...${id.slice(id.length - 5, id.length)}`;
        }

        return id;
    };

    const openArtifactLink = (link: string) => {
        openLink(link);
        handleMenuClose();
    };

    const copyLink = (link: string) => {
        navigator.clipboard.writeText(link);
        handleMenuClose();
    };

    if (!nftObject) {
        return <div />;
    }

    const menuOpen = Boolean(menuAnchorEl);
    const author = nftObject.author ? nftObject.author : nftObject.creators;

    return (
        <Container>
            <Col>
                {nftObject && nftObject.artifactUrl ? (
                    <Media
                        source={nftObject.artifactUrl}
                        type={nftObject.artifactType}
                        alt={nftObject.name}
                        useNFTFailedBox={true}
                        nftProvider={nftObject.provider}
                        thumbProps={{
                            thumbnailUri: nftObject.artifactType?.startsWith('image') ? nftObject.artifactUrl : nftObject.thumbnailUri,
                        }}
                        previewProps={{
                            autoplay: true,
                            controls: true,
                            loop: true,
                        }}
                        artifactModerationMessage={nftObject.artifactModerationMessage}
                    />
                ) : null}
            </Col>
            <Col>
                <Header>
                    <Title>{nftObject.name}</Title>
                    {nftObject.artifactUrl ? (
                        <div>
                            <MenuButton onClick={handleMenuClick} size="small">
                                <MoreVertIcon fontSize="inherit" />
                            </MenuButton>
                            <Menu
                                open={menuOpen}
                                anchorEl={menuAnchorEl}
                                onClose={handleMenuClose}
                                style={{ marginTop: '10px', padding: '0' }}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                disableAutoFocus={true}
                                disableEnforceFocus={true}
                            >
                                <StyledMenuItem onClick={() => openArtifactSite()}>
                                    <StyledListItemIcon>
                                        <RemoveRedEyeOutlinedIcon fontSize="small" />
                                    </StyledListItemIcon>
                                    <ListItemText>
                                        {t(`components.image.view_on`, {
                                            provider: t(`components.nftGallery.providers.${nftObject.provider}`),
                                        })}
                                    </ListItemText>
                                </StyledMenuItem>
                                <Divider />
                                {nftObject.artifactUrl && nftObject.artifactUrl.includes('/ipfs') ? (
                                    <StyledMenuItem onClick={() => openArtifactLink(nftObject.artifactUrl!)}>
                                        <StyledListItemIcon>
                                            <OpenInNewIcon fontSize="small" />
                                        </StyledListItemIcon>
                                        <ListItemText>
                                            {t(`components.image.view_on`, {
                                                provider: t('components.nftGallery.providers.IPFS'),
                                            })}
                                        </ListItemText>
                                    </StyledMenuItem>
                                ) : null}
                                {nftObject.artifactUrl && nftObject.artifactUrl.includes('/ipfs') ? <Divider /> : null}
                                <StyledMenuItem onClick={() => copyLink(nftObject.artifactUrl!)}>
                                    <StyledListItemIcon>
                                        <LinkIcon fontSize="small" />
                                    </StyledListItemIcon>
                                    <ListItemText>{t('general.verbs.copy_link')}</ListItemText>
                                </StyledMenuItem>
                            </Menu>
                        </div>
                    ) : null}
                </Header>
                {author && (
                    <Creator>
                        <Capitalize>{t('general.prepositions.by')}:</Capitalize>
                        {author}
                    </Creator>
                )}
                <Description>{nftObject.description}</Description>
                <CustomDivider />
                <AttributesList>
                    <Attribute>
                        <AttributeLabel>{t('components.nftGallery.modal.token')}:</AttributeLabel>
                        <AttributeValue>{shortenObjectId(nftObject.objectId)}</AttributeValue>
                    </Attribute>
                    <Attribute>
                        <AttributeLabel>{t('components.nftGallery.modal.collectedOn')}:</AttributeLabel>
                        <AttributeValue>{nftObject.receivedOn.toLocaleDateString()}</AttributeValue>
                    </Attribute>
                    <Attribute>
                        <AttributeLabel>{t('components.nftGallery.modal.collectedFor')}:</AttributeLabel>
                        <AttributeValue>
                            {formatAmount(nftObject.price, 4)}
                            <StyledTezosIcon color="black3" iconName="tezos" />
                        </AttributeValue>
                    </Attribute>
                    <Attribute>
                        <AttributeLabel>{t('components.nftGallery.modal.quantity')}:</AttributeLabel>
                        <AttributeValue>{nftObject.amount}</AttributeValue>
                    </Attribute>
                </AttributesList>
            </Col>
        </Container>
    );
};
