import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';

import LinkIcon from '@material-ui/icons/Link';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import RemoveRedEyeOutlinedIcon from '@material-ui/icons/RemoveRedEyeOutlined';

import {
    Attribute,
    AttributesList,
    AttributeLabel,
    AttributeValue,
    Capitalize,
    Container,
    Col,
    Creator,
    CustomDivider,
    Description,
    Header,
    MenuButton,
    Title,
    StyledListItemIcon,
    StyledMenuItem,
    StyledMenuList,
    StyledTezosIcon,
} from './style';

import { NFTMoreInfoProps } from '../../types';

import Media from '../../../../components/Media';

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
                                style={{ marginTop: '100px', padding: '0' }}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                            >
                                <StyledMenuList>
                                    <StyledMenuItem onClick={() => openArtifactLink(`https://www.hicetnunc.xyz/objkt/${nftObject.objectId}`)}>
                                        <StyledListItemIcon>
                                            <RemoveRedEyeOutlinedIcon fontSize="small" />
                                        </StyledListItemIcon>
                                        <ListItemText>
                                            {t(`components.image.view_on`, {
                                                provider: t('components.nftGallery.providers.HIC_ET_NUNC'),
                                            })}
                                        </ListItemText>
                                    </StyledMenuItem>
                                    <Divider />
                                    {nftObject.artifactUrl && nftObject.artifactUrl.includes('/ipfs') ? (
                                        <>
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
                                            <Divider />
                                        </>
                                    ) : null}
                                    <StyledMenuItem onClick={() => copyLink(nftObject.artifactUrl!)}>
                                        <StyledListItemIcon>
                                            <LinkIcon fontSize="small" />
                                        </StyledListItemIcon>
                                        <ListItemText>{t('general.verbs.copy_link')}</ListItemText>
                                    </StyledMenuItem>
                                </StyledMenuList>
                            </Menu>
                        </div>
                    ) : null}
                </Header>
                <Creator>
                    <Capitalize>{t('general.prepositions.by')}:</Capitalize>
                    {nftObject.creators}
                </Creator>
                <Description>{nftObject.description}</Description>
                <CustomDivider />
                <AttributesList>
                    <Attribute>
                        <AttributeLabel>{t('components.nftGallery.modal.token')}:</AttributeLabel>
                        <AttributeValue>{nftObject.objectId}</AttributeValue>
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
